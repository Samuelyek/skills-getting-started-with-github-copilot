import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)


def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data


def test_signup_for_activity():
    email = "testuser@mergington.edu"
    activity = "Chess Club"
    # 确保先移除该用户
    client.post(f"/activities/{activity}/unregister?email={email}")
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 200
    assert "Signed up" in response.json()["message"]
    # 重复注册应报错
    response2 = client.post(f"/activities/{activity}/signup?email={email}")
    assert response2.status_code == 400


def test_unregister_from_activity():
    email = "testuser2@mergington.edu"
    activity = "Chess Club"
    # 先注册
    client.post(f"/activities/{activity}/signup?email={email}")
    response = client.post(f"/activities/{activity}/unregister?email={email}")
    assert response.status_code == 200
    assert "Unregistered" in response.json()["message"]
    # 再注销应报错
    response2 = client.post(f"/activities/{activity}/unregister?email={email}")
    assert response2.status_code == 400


def test_signup_invalid_activity():
    response = client.post("/activities/InvalidActivity/signup?email=someone@mergington.edu")
    assert response.status_code == 404


def test_unregister_invalid_activity():
    response = client.post("/activities/InvalidActivity/unregister?email=someone@mergington.edu")
    assert response.status_code == 404
