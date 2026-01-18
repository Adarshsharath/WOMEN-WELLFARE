import pytesseract
from PIL import Image, ImageOps, ImageEnhance
import re
import io

# If tesseract is not in your PATH, uncomment and set the path:
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def binarize_image(image, threshold=128):
    """Convert image to black and white for better OCR"""
    try:
        return image.point(lambda p: 255 if p > threshold else 0)
    except Exception:
        return image

def preprocess_image(image):
    """Enhance image for better OCR results"""
    try:
        # Resize image to 4x size
        width, height = image.size
        new_size = (width * 4, height * 4)
        image = image.resize(new_size, Image.Resampling.LANCZOS)
        
        # Convert to grayscale
        gray = ImageOps.grayscale(image)
        
        # Equalize histogram
        equalized = ImageOps.equalize(gray)
        
        # Increase contrast
        enhancer = ImageEnhance.Contrast(equalized)
        enhanced = enhancer.enhance(4.0)
        
        # Sharpen
        enhancer = ImageEnhance.Sharpness(enhanced)
        enhanced = enhancer.enhance(3.0)
        
        return enhanced
    except Exception as e:
        print(f"Preprocessing error: {e}")
        return image

def extract_text_from_image(image_bytes):
    """Extract text from image bytes using multiple preprocessing steps"""
    try:
        original_image = Image.open(io.BytesIO(image_bytes))
        
        # 1. Try with standard preprocessing
        enhanced = preprocess_image(original_image)
        text = pytesseract.image_to_string(enhanced)
        
        # 2. Try with different PSMs
        for psm in ['3', '6', '11', '12']:
            text += "\n" + pytesseract.image_to_string(enhanced, config=f'--psm {psm}')
        
        # 3. Try binarized versions
        text += "\n" + pytesseract.image_to_string(binarize_image(enhanced, 128))
        text += "\n" + pytesseract.image_to_string(binarize_image(enhanced, 180))
        
        return text
    except Exception as e:
        print(f"OCR Error: {e}")
        return ""

def verify_aadhar(text):
    """
    Verify Aadhar card: 
    - Check for 12-digit number (robust pattern)
    - Check for 'Female' or female-like words
    """
    text_clean = re.sub(r'[^a-zA-Z0-9\s]', '', text).lower()
    
    # Robust 12-digit check: find any 12 digits, even if spaces are weird
    digits_only = re.sub(r'\D', '', text)
    has_12_digits = len(re.findall(r'\d{12}', digits_only)) > 0
    
    # Or match the standard format in text
    has_formatted_aadhar = re.search(r'\d{4}\s?\d{4}\s?\d{4}', text) is not None
    
    valid_id = has_12_digits or has_formatted_aadhar

    # Look for gender - very loose matching as requested
    # We look in both clean and raw text
    gender_patterns = [
        r'female', r'femlae', r'fenale', r'fcmale', r'female', 
        r'f\.male', r'fem\s?ale', r'gender\s?f', r'\bf\b', r'/f'
    ]
    
    is_female = any(re.search(p, text.lower()) for p in gender_patterns) or \
                any(re.search(p, text_clean) for p in gender_patterns)
    
    # If it's clearly "MALE" (not "FEMALE")
    is_clearly_male = re.search(r'\bmale\b', text.lower()) and not re.search(r'female', text.lower())

    print(f"OCR Match Internal: 12-Digits={valid_id}, Female-Detected={is_female}, Clearly-Male={bool(is_clearly_male)}")

    # Allow if 12 digits are present AND we have any female hint
    return valid_id and is_female and not is_clearly_male

def verify_passport(text):
    """
    Verify Passport:
    - Check for 'Female' or 'F' (usually in gender field)
    """
    text = text.lower()
    # Passport gender field is often 'F' or 'Female'
    is_female = re.search(r'\bf\b|female|f\s?m\s?l', text) is not None
    return is_female

def verify_document(image_bytes, doc_type):
    """Main entry point for document verification"""
    text = extract_text_from_image(image_bytes)
    print(f"OCR Extracted Text (Final):\n{text}") # Debug log
    
    if doc_type.upper() == 'AADHAR':
        return verify_aadhar(text)
    elif doc_type.upper() == 'PASSPORT':
        return verify_passport(text)
    else:
        return False
