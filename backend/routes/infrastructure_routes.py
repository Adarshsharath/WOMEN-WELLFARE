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
