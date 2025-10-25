<?php
require_once __DIR__ . '/../db.php';

$body = json_decode(file_get_contents('php://input'), true) ?: [];
$email = strtolower(trim($body['email'] ?? ''));
$password = (string)($body['password'] ?? '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password==='') {
  json_err("VALIDATION_ERROR","invalid_credential");
}

try {
  $stmt = $dbh->prepare("SELECT id,fname,lname,email,password_hash,role,avatar FROM user WHERE email=?");
  $stmt->execute([$email]);
  $u = $stmt->fetch();

  if (!$u || !password_verify($password, $u['password_hash'])) {
    json_err("BAD_CREDENTIALS","bad_credentials",401);
  }

  // set session
  $_SESSION['user_id'] = (int)$u['id'];
  $_SESSION['role'] = $u['role'];
  unset($u['password_hash']);

  json_ok($u);
} catch (Throwable $e) {
  json_err("DB_ERROR","db_error",500);
}
