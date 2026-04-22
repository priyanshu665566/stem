import random 
import string
import re


def generate_password(length=8):
    return ''.join(random.choices(string.ascii_letters + string.digits + string.punctuation, k=length))

def is_valid_email(email):
    pattern = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.(com|in)$'
    return re.match(pattern, str(email)) is not None

