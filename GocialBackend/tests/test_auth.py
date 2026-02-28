"""
Tests pour l'API d'authentification.
"""
import json


def test_health_check(client):
    """Test de la route de santé."""
    response = client.get('/health')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'ok'


def test_register_person(client):
    """Test d'inscription d'une personne."""
    response = client.post('/api/auth/register', 
        data=json.dumps({
            'email': 'test@example.com',
            'password': 'password123',
            'user_type': 'person',
            'first_name': 'Test',
            'pseudo': 'testuser'
        }),
        content_type='application/json'
    )
    
    assert response.status_code == 201
    data = json.loads(response.data)
    assert 'access_token' in data
    assert data['user']['email'] == 'test@example.com'


def test_register_duplicate_email(client):
    """Test d'inscription avec email dupliqué."""
    # Premier utilisateur
    client.post('/api/auth/register',
        data=json.dumps({
            'email': 'test@example.com',
            'password': 'password123',
            'user_type': 'person'
        }),
        content_type='application/json'
    )
    
    # Deuxième utilisateur avec même email
    response = client.post('/api/auth/register',
        data=json.dumps({
            'email': 'test@example.com',
            'password': 'password456',
            'user_type': 'person'
        }),
        content_type='application/json'
    )
    
    assert response.status_code == 409


def test_login(client):
    """Test de connexion."""
    # Créer un utilisateur
    client.post('/api/auth/register',
        data=json.dumps({
            'email': 'test@example.com',
            'password': 'password123',
            'user_type': 'person'
        }),
        content_type='application/json'
    )
    
    # Se connecter
    response = client.post('/api/auth/login',
        data=json.dumps({
            'email': 'test@example.com',
            'password': 'password123'
        }),
        content_type='application/json'
    )
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'access_token' in data


def test_login_wrong_password(client):
    """Test de connexion avec mauvais mot de passe."""
    # Créer un utilisateur
    client.post('/api/auth/register',
        data=json.dumps({
            'email': 'test@example.com',
            'password': 'password123',
            'user_type': 'person'
        }),
        content_type='application/json'
    )
    
    # Se connecter avec mauvais mot de passe
    response = client.post('/api/auth/login',
        data=json.dumps({
            'email': 'test@example.com',
            'password': 'wrongpassword'
        }),
        content_type='application/json'
    )
    
    assert response.status_code == 401
