from flask import Blueprint, request, jsonify
from models import db, Issue
from auth import token_required, role_required
from datetime import datetime

infrastructure_bp = Blueprint('infrastructure', __name__)


@infrastructure_bp.route('/issues', methods=['GET'])
@token_required
@role_required('INFRASTRUCTURE')
def get_all_issues(current_user):
    """Get all issues (pending and assigned)"""
    status_filter = request.args.get('status')  # Optional filter
    
    query = Issue.query
    
    if status_filter:
        query = query.filter_by(status=status_filter.upper())
    
    issues = query.order_by(Issue.timestamp.desc()).all()
    
    return jsonify({
        'success': True,
        'issues': [issue.to_dict() for issue in issues]
    }), 200


@infrastructure_bp.route('/issue/<int:issue_id>/accept', methods=['PUT'])
@token_required
@role_required('INFRASTRUCTURE')
def accept_issue(current_user, issue_id):
    """Accept an issue"""
    issue = Issue.query.get(issue_id)
    
    if not issue:
        return jsonify({'error': 'Issue not found'}), 404
    
    if issue.status != 'PENDING':
        return jsonify({'error': 'Issue already processed'}), 400
    
    issue.status = 'ACCEPTED'
    issue.assigned_to_infra_id = current_user.id
    issue.accepted_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Issue accepted',
        'issue': issue.to_dict()
    }), 200


@infrastructure_bp.route('/issue/<int:issue_id>/complete', methods=['PUT'])
@token_required
@role_required('INFRASTRUCTURE')
def complete_issue(current_user, issue_id):
    """Mark issue as completed"""
    issue = Issue.query.get(issue_id)
    
    if not issue:
        return jsonify({'error': 'Issue not found'}), 404
    
    if issue.assigned_to_infra_id != current_user.id:
        return jsonify({'error': 'Can only complete issues assigned to you'}), 403
    
    if issue.status != 'ACCEPTED':
        return jsonify({'error': 'Issue not in accepted status'}), 400
    
    issue.status = 'COMPLETED'
    issue.completed_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Issue marked as completed',
        'issue': issue.to_dict()
    }), 200


@infrastructure_bp.route('/my-issues', methods=['GET'])
@token_required
@role_required('INFRASTRUCTURE')
def get_my_issues(current_user):
    """Get issues assigned to this infrastructure user"""
    issues = Issue.query.filter_by(
        assigned_to_infra_id=current_user.id
    ).order_by(Issue.timestamp.desc()).all()
    
    return jsonify({
        'success': True,
        'issues': [issue.to_dict() for issue in issues]
    }), 200


@infrastructure_bp.route('/dashboard-stats', methods=['GET'])
@token_required
@role_required('INFRASTRUCTURE')
def get_dashboard_stats(current_user):
    """Get statistics for infrastructure dashboard"""
    from datetime import datetime, timedelta
    
    # Overall Statistics
    total_issues = Issue.query.count()
    pending_issues = Issue.query.filter_by(status='PENDING').count()
    accepted_issues = Issue.query.filter_by(status='ACCEPTED').count()
    completed_issues = Issue.query.filter_by(status='COMPLETED').count()
    
    # My Statistics
    my_total = Issue.query.filter_by(assigned_to_infra_id=current_user.id).count()
    my_accepted = Issue.query.filter_by(assigned_to_infra_id=current_user.id, status='ACCEPTED').count()
    my_completed = Issue.query.filter_by(assigned_to_infra_id=current_user.id, status='COMPLETED').count()
    
    # Recent activity (last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_issues = Issue.query.filter(Issue.timestamp >= week_ago).count()
    recent_completed = Issue.query.filter(
        Issue.completed_at >= week_ago
    ).count() if Issue.query.filter(Issue.completed_at.isnot(None)).count() > 0 else 0
    
    # Daily completion trend (last 7 days)
    daily_completions = []
    for i in range(6, -1, -1):
        day_start = datetime.utcnow().replace(hour=0, minute=0, second=0) - timedelta(days=i)
        day_end = day_start + timedelta(days=1)
        count = Issue.query.filter(
            Issue.completed_at >= day_start,
            Issue.completed_at < day_end
        ).count()
        daily_completions.append({
            'date': day_start.strftime('%a'),
            'completed': count
        })
    
    # Issue status distribution
    status_distribution = [
        {'status': 'PENDING', 'count': pending_issues},
        {'status': 'ACCEPTED', 'count': accepted_issues},
        {'status': 'COMPLETED', 'count': completed_issues}
    ]
    
    # Completion rate
    completion_rate = round((completed_issues / total_issues * 100) if total_issues > 0 else 0, 1)
    
    return jsonify({
        'success': True,
        'stats': {
            'overall': {
                'total': total_issues,
                'pending': pending_issues,
                'accepted': accepted_issues,
                'completed': completed_issues,
                'completion_rate': completion_rate
            },
            'my_work': {
                'total': my_total,
                'accepted': my_accepted,
                'completed': my_completed
            },
            'recent': {
                'new_issues': recent_issues,
                'completed': recent_completed
            },
            'trends': {
                'daily_completions': daily_completions,
                'status_distribution': status_distribution
            }
        }
    }), 200


@infrastructure_bp.route('/chat', methods=['GET'])
@token_required
@role_required('INFRASTRUCTURE')
def get_infrastructure_chat(current_user):
    """Get infrastructure chat messages"""
    from models import ChatMessage
    messages = ChatMessage.query.filter_by(
        chat_type='INFRASTRUCTURE'
    ).order_by(ChatMessage.timestamp.desc()).limit(100).all()
    
    return jsonify({
        'success': True,
        'messages': [msg.to_dict() for msg in reversed(messages)]
    }), 200


@infrastructure_bp.route('/chat', methods=['POST'])
@token_required
@role_required('INFRASTRUCTURE')
def send_infrastructure_chat(current_user):
    """Send message in infrastructure chat"""
    from models import ChatMessage
    data = request.get_json()
    
    if not data.get('message'):
        return jsonify({'error': 'Message required'}), 400
    
    message = ChatMessage(
        sender_id=current_user.id,
        message_text=data['message'],
        chat_type='INFRASTRUCTURE'
    )
    
    db.session.add(message)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': message.to_dict()
    }), 201
