"""
CLI commands for Gocial

Custom Flask CLI commands for testing, linting, seeding, etc.
Run with: flask <command>
"""

import os
import sys
from glob import glob
from subprocess import call

import click
from flask import current_app
from flask.cli import with_appcontext

from app import db
from app.models import User, Role


# ---------------------------------------------------------------------
# Test command
# ---------------------------------------------------------------------

@click.command()
@click.option('-c/-C', '--coverage/--no-coverage', default=True,
              help='Show coverage report')
@click.option('-k', '--filter', default=None,
              help='Filter tests by keyword')
@click.option('-v', '--verbose', is_flag=True, default=False,
              help='Verbose output')
def test(coverage, filter, verbose):
    """
    Run the test suite.
    
    Usage:
        flask test              # run all tests with coverage
        flask test -k auth      # run tests matching 'auth'
        flask test -C           # skip coverage report
    """
    import pytest
    
    args = ['tests/']
    
    if verbose:
        args.append('-v')
    
    if filter:
        args.extend(['-k', filter])
    
    if coverage:
        args.extend(['--cov=app', '--cov-report=term-missing'])
    
    result = pytest.main(args)
    sys.exit(result)


# ---------------------------------------------------------------------
# Lint command
# ---------------------------------------------------------------------

@click.command()
@click.option('-f', '--fix-imports', is_flag=True, default=False,
              help='Fix import order with isort')
@click.option('-c', '--check', is_flag=True, default=False,
              help='Check only, do not modify files')
def lint(fix_imports, check):
    """
    Lint and format code.
    
    Usage:
        flask lint              # format and lint
        flask lint --check      # check only, no changes
        flask lint -f           # also fix import order
    """
    # Directories to check
    dirs = ['app', 'tests']
    skip = ['migrations', '__pycache__', '.git', 'venv']
    
    files_and_dirs = [d for d in dirs if os.path.exists(d) and d not in skip]
    
    def execute_tool(description, *args):
        """Run a command and exit on failure."""
        cmd = list(args) + files_and_dirs
        click.echo(f'{description}: {" ".join(cmd)}')
        rv = call(cmd)
        if rv != 0:
            click.echo(f'{description} failed!')
            sys.exit(rv)
    
    if fix_imports:
        isort_args = ['isort']
        if check:
            isort_args.append('--check')
        execute_tool('Fixing imports', *isort_args)
    
    black_args = ['black']
    if check:
        black_args.append('--check')
    execute_tool('Formatting code', *black_args)
    
    execute_tool('Checking code style', 'flake8', '--max-line-length=100')
    
    click.echo('✓ All checks passed!')


# ---------------------------------------------------------------------
# Seed command
# ---------------------------------------------------------------------

@click.command()
@click.option('--users', default=10, help='Number of test users to create')
@click.option('--activities', default=20, help='Number of test activities')
@with_appcontext
def seed(users, activities):
    """
    Seed the database with test data.
    
    Usage:
        flask seed                  # default: 10 users, 20 activities
        flask seed --users 50       # create 50 users
    """
    from datetime import datetime, timedelta
    import random
    
    click.echo('Seeding database...')
    
    # Create roles
    admin_role = Role.get_or_create('admin', 'Full system access')
    mod_role = Role.get_or_create('moderator', 'Can moderate content')
    user_role = Role.get_or_create('user', 'Regular user')
    
    click.echo(f'✓ Created roles')
    
    # Create admin user if doesn't exist
    admin = User.query.filter_by(email='admin@gocial.app').first()
    if not admin:
        admin = User(
            email='admin@gocial.app',
            pseudo='admin',
            first_name='Admin',
            user_type='person',
            is_admin=True,
            is_verified=True,
        )
        admin.set_password('Admin123!')
        admin.add_role(admin_role)
        db.session.add(admin)
        db.session.commit()
        click.echo(f'✓ Created admin user (admin@gocial.app / Admin123!)')
    
    # Create test users
    cities = ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Toulouse', 'Nantes']
    user_types = ['person', 'person', 'person', 'pro', 'asso']
    
    created_users = []
    for i in range(users):
        email = f'user{i}@test.com'
        if not User.query.filter_by(email=email).first():
            user = User(
                email=email,
                pseudo=f'testuser{i}',
                first_name=f'Test',
                last_name=f'User{i}',
                user_type=random.choice(user_types),
                city=random.choice(cities),
                is_verified=random.choice([True, True, False]),
                is_active=True,
            )
            user.set_password('Test123!')
            db.session.add(user)
            created_users.append(user)
    
    db.session.commit()
    click.echo(f'✓ Created {len(created_users)} test users')
    
    # Create test activities
    from app.models import Activity
    
    categories = ['sport', 'party', 'culture', 'food', 'hiking', 'games', 'music']
    all_users = User.query.all()
    
    created_activities = 0
    for i in range(activities):
        host = random.choice(all_users)
        date = datetime.utcnow() + timedelta(days=random.randint(1, 30))
        
        activity = Activity(
            host_id=host.id,
            title=f'Test Activity {i}',
            description=f'This is a test activity #{i}',
            activity_type=random.choice(['real', 'visio']),
            category=random.choice(categories),
            date=date,
            city=random.choice(cities),
            max_participants=random.randint(3, 20),
            status='published',
            visibility='public',
        )
        db.session.add(activity)
        created_activities += 1
    
    db.session.commit()
    click.echo(f'✓ Created {created_activities} test activities')
    
    click.echo('')
    click.echo('Database seeded successfully!')
    click.echo('Admin login: admin@gocial.app / admin123')


# ---------------------------------------------------------------------
# Reset DB command
# ---------------------------------------------------------------------

@click.command('reset-db')
@click.option('--yes', '-y', is_flag=True, help='Skip confirmation')
@with_appcontext
def reset_db(yes):
    """
    Reset the database (drop all tables and recreate).
    
    Use with caution!
    """
    if not yes:
        click.confirm('This will delete ALL data. Continue?', abort=True)
    
    click.echo('Dropping all tables...')
    db.drop_all()
    
    click.echo('Creating tables...')
    db.create_all()
    
    click.echo('✓ Database reset complete')


# ---------------------------------------------------------------------
# Create admin command
# ---------------------------------------------------------------------

@click.command('create-admin')
@click.option('--email', prompt=True, help='Admin email')
@click.option('--password', prompt=True, hide_input=True, 
              confirmation_prompt=True, help='Admin password')
@with_appcontext
def create_admin(email, password):
    """
    Create an admin user.
    """
    if User.query.filter_by(email=email).first():
        click.echo(f'Error: User with email {email} already exists')
        return
    
    admin_role = Role.get_or_create('admin', 'Full system access')
    
    user = User(
        email=email,
        pseudo=email.split('@')[0],
        user_type='person',
        is_admin=True,
        is_verified=True,
    )
    user.set_password(password)
    user.add_role(admin_role)
    
    db.session.add(user)
    db.session.commit()
    
    click.echo(f'✓ Admin user created: {email}')


# ---------------------------------------------------------------------
# Register all commands with app
# ---------------------------------------------------------------------

def register_commands(app):
    """Register CLI commands with the Flask app."""
    app.cli.add_command(test)
    app.cli.add_command(lint)
    app.cli.add_command(seed)
    app.cli.add_command(reset_db)
    app.cli.add_command(create_admin)
