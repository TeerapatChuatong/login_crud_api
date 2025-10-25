<?php
require_once __DIR__ . '/../db.php';

// รับ JSON
$body = json_decode(file_get_contents('php://input'), true) ?: [];
$fname = trim($body['fname'] ?? '');
$lname = trim($body['lname'] ?? '');
$email = strtolower(trim($body['email'] ?? ''));
$password = (string)($body['password'] ?? '');
$avatar = trim($body['avatar'] ?? '');

// รองรับชื่อเดียว (เผื่อฟอร์มใช้ name/username)
if ($fname === '') { $fname = trim($body['name'] ?? $body['username'] ?? ''); }

// ตรวจข้อมูล
if ($fname==='' || $email==='' || $password==='') json_err("VALIDATION_ERROR","missing_fields");
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) json_err("VALIDATION_ERROR","invalid_email");
if (strlen($password) < 6) json_err("VALIDATION_ERROR","weak_password_min_6");

try {
  // อีเมลซ้ำ
  $chk = $dbh->prepare("SELECT id FROM user WHERE email = ?");
  $chk->execute([$email]);
  if ($chk->fetch()) json_err("EMAIL_TAKEN","email_exists");

  $hash = password_hash($password, PASSWORD_BCRYPT);

  $ins = $dbh->prepare("
    INSERT INTO user (fname, lname, email, avatar, password_hash, role)
    VALUES (?, ?, ?, ?, ?, 'user')
  ");
  $ok = $ins->execute([$fname, $lname ?: '', $email, $avatar ?: null, $hash]);
  if (!$ok) json_err("INSERT_FAIL","insert_failed",500);

  // auto login
  $_SESSION['user_id'] = (int)$dbh->lastInsertId();
  $_SESSION['role'] = 'user';

  json_ok([
    "id" => (int)$_SESSION['user_id'],
    "fname"=>$fname, "lname"=>$lname, "email"=>$email,
    "role"=>"user", "avatar"=>$avatar ?: null
  ]);
} catch (Throwable $e) {
  json_err("DB_ERROR","db_error",500);
}
