from flask import Flask, request, jsonify, session, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import os
from datetime import datetime

# Set up paths
base_dir = os.path.abspath(os.path.dirname(__file__))
frontend_dir = os.path.join(base_dir, '..', 'frontend')

# Initialize Flask with custom static folder
app = Flask(__name__, static_folder=frontend_dir, static_url_path='')
app.secret_key = 'your_secret_key_here' # Change this in production
CORS(app, supports_credentials=True)

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(base_dir, 'expense_tracker.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- Models ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    expenses = db.relationship('Expense', backref='user', lazy=True)
    incomes = db.relationship('Income', backref='user', lazy=True)

class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(200))
    date = db.Column(db.String(20), nullable=False) # Storing as YYYY-MM-DD string for simplicity
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class Income(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    source = db.Column(db.String(100), nullable=False)
    date = db.Column(db.String(20), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

# --- Category Mapping (Helper) ---
# Fronted sends category_id, we map to names or store ID. 
# Based on frontend JS: 1: 'Food & Dining', 2: 'Transportation', etc.
# Ideally, we should store the string or have a Category table. 
# For simplicity and matching frontend logic, we'll convert ID to String here or store String.
CATEGORY_MAP = {
    1: 'Food & Dining',
    2: 'Transportation',
    3: 'Shopping',
    4: 'Entertainment',
    5: 'Bills & Utilities',
    6: 'Healthcare',
    7: 'Others'
}

# --- Routes ---

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400

    hashed_password = generate_password_hash(password)
    new_user = User(username=username, password_hash=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User created successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if user and check_password_hash(user.password_hash, password):
        session['user_id'] = user.id
        return jsonify({'message': 'Login successful', 'user_id': user.id})
    else:
        return jsonify({'error': 'Invalid username or password'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out successfully'})

def get_current_user_id():
    return session.get('user_id')

@app.route('/api/expenses', methods=['GET', 'POST'])
def handle_expenses():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    if request.method == 'GET':
        expenses = Expense.query.filter_by(user_id=user_id).order_by(Expense.date.desc()).all()
        result = []
        for exp in expenses:
            result.append({
                'id': exp.id,
                'amount': exp.amount,
                'category': exp.category,
                'description': exp.description,
                'date': exp.date
            })
        return jsonify(result)

    if request.method == 'POST':
        data = request.get_json()
        
        # Handle category_id from frontend
        category_val = data.get('category_id')
        category_name = CATEGORY_MAP.get(category_val, 'Others') if isinstance(category_val, int) else data.get('category', 'Others')

        new_expense = Expense(
            amount=data.get('amount'),
            category=category_name,
            description=data.get('description'),
            date=data.get('date'),
            user_id=user_id
        )
        db.session.add(new_expense)
        db.session.commit()
        return jsonify({'message': 'Expense added successfully', 'id': new_expense.id}), 201

@app.route('/api/expenses/<int:expense_id>', methods=['DELETE', 'PUT'])
def handle_single_expense(expense_id):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    expense = Expense.query.filter_by(id=expense_id, user_id=user_id).first()
    if not expense:
        return jsonify({'error': 'Expense not found'}), 404

    if request.method == 'DELETE':
        db.session.delete(expense)
        db.session.commit()
        return jsonify({'message': 'Expense deleted'})

    if request.method == 'PUT':
        data = request.get_json()
        category_val = data.get('category_id')
        category_name = CATEGORY_MAP.get(category_val, 'Others') if isinstance(category_val, int) else data.get('category', expense.category)

        expense.amount = data.get('amount', expense.amount)
        expense.category = category_name
        expense.description = data.get('description', expense.description)
        expense.date = data.get('date', expense.date)
        
        db.session.commit()
        return jsonify({'message': 'Expense updated'})

@app.route('/api/income', methods=['GET', 'POST'])
def handle_income():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    if request.method == 'GET':
        incomes = Income.query.filter_by(user_id=user_id).order_by(Income.date.desc()).all()
        result = []
        for inc in incomes:
            result.append({
                'id': inc.id,
                'amount': inc.amount,
                'source': inc.source,
                'date': inc.date
            })
        return jsonify(result)

    if request.method == 'POST':
        data = request.get_json()
        new_income = Income(
            amount=data.get('amount'),
            source=data.get('source'),
            date=data.get('date'),
            user_id=user_id
        )
        db.session.add(new_income)
        db.session.commit()
        return jsonify({'message': 'Income added successfully', 'id': new_income.id}), 201

@app.route('/api/income/<int:income_id>', methods=['DELETE'])
def delete_income(income_id):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    income = Income.query.filter_by(id=income_id, user_id=user_id).first()
    if not income:
        return jsonify({'error': 'Income not found'}), 404

    db.session.delete(income)
    db.session.commit()
    return jsonify({'message': 'Income deleted'})

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard_data():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    # Calculate totals
    expenses = Expense.query.filter_by(user_id=user_id).all()
    incomes = Income.query.filter_by(user_id=user_id).all()

    total_expenses = sum(exp.amount for exp in expenses)
    total_income = sum(inc.amount for inc in incomes)
    current_balance = total_income - total_expenses

    # Category breakdown
    category_breakdown = {}
    for exp in expenses:
        category_breakdown[exp.category] = category_breakdown.get(exp.category, 0) + exp.amount

    return jsonify({
        'total_income': total_income,
        'total_expenses': total_expenses,
        'current_balance': current_balance,
        'category_breakdown': category_breakdown
    })

@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    data = request.get_json()
    message = data.get('message', '').lower()
    user_id = get_current_user_id()
    
    response = "I'm not sure I understand. Try asking about your balance, total spending, or specific categories."

    # --- User Data Queries (Requires Login) ---
    if not user_id:
        if 'login' in message or 'sign in' in message:
             return jsonify({'response': "You can log in using the form on the home page."})
        return jsonify({'response': "Please log in to ask about your personal financial data."})

    try:
        if 'balance' in message or 'left' in message:
            expenses = Expense.query.filter_by(user_id=user_id).all()
            incomes = Income.query.filter_by(user_id=user_id).all()
            total_exp = sum(e.amount for e in expenses)
            total_inc = sum(i.amount for i in incomes)
            bal = total_inc - total_exp
            response = f"Your current balance is **₹{bal:,.2f}**."
            if bal < 0:
                response += " (You are in overdraft! ⚠️)"

        elif 'income' in message or 'earn' in message:
             incomes = Income.query.filter_by(user_id=user_id).all()
             total_inc = sum(i.amount for i in incomes)
             response = f"You have earned a total of **₹{total_inc:,.2f}** so far."

        elif 'total' in message and ('spend' in message or 'expense' in message):
            expenses = Expense.query.filter_by(user_id=user_id).all()
            total_exp = sum(e.amount for e in expenses)
            response = f"Your total spending is **₹{total_exp:,.2f}**."

        elif 'recent' in message or 'last' in message:
            recent_expenses = Expense.query.filter_by(user_id=user_id).order_by(Expense.date.desc()).limit(3).all()
            if recent_expenses:
                items = [f"- {e.category}: ₹{e.amount:.2f} ({e.date})" for e in recent_expenses]
                response = "Here are your last 3 expenses:<br>" + "<br>".join(items)
            else:
                response = "You don't have any recent expenses recorded."

        elif 'food' in message:
            # Flexible matching for "Food & Dining"
            expenses = Expense.query.filter_by(user_id=user_id).filter(Expense.category.like('%Food%')).all()
            total = sum(e.amount for e in expenses)
            response = f"You've spent **₹{total:,.2f}** on Food & Dining."

        elif 'transport' in message:
            expenses = Expense.query.filter_by(user_id=user_id).filter(Expense.category.like('%Transport%')).all()
            total = sum(e.amount for e in expenses)
            response = f"You've spent **₹{total:,.2f}** on Transportation."
        
        elif 'shopping' in message:
            expenses = Expense.query.filter_by(user_id=user_id).filter(Expense.category.like('%Shopping%')).all()
            total = sum(e.amount for e in expenses)
            response = f"You've spent **₹{total:,.2f}** on Shopping."

        elif 'utilities' in message or 'bill' in message:
            expenses = Expense.query.filter_by(user_id=user_id).filter(Expense.category.like('%Bills%')).all()
            total = sum(e.amount for e in expenses)
            response = f"You've spent **₹{total:,.2f}** on Bills & Utilities."

        elif 'save' in message or 'saving' in message:
             response = "To save more, try the 50/30/20 rule: 50% needs, 30% wants, 20% savings. Check which category has the highest spending!"

        elif 'hello' in message or 'hi' in message:
            user = User.query.get(user_id)
            name = user.username if user else "friend"
            response = f"Hello {name}! I can help you check your balance, total spending, or category details. What do you want to know?"

    except Exception as e:
        print(f"Chatbot Error: {e}")
        response = "I ran into an issue checking your data. Please try again."

    return jsonify({'response': response})

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
