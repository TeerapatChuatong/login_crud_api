<?php
require_once __DIR__ . '/../db.php';

$body     = json_decode(file_get_contents('php://input'), true) ?: [];
$account  = strtolower(trim($body['account'] ?? $body['email'] ?? ''));
$password = (string)($body['password'] ?? '');

if ($account === '' || $password === '') {
  json_err("VALIDATION_ERROR","invalid_credential", 422);
}

try {
  // มี username ไหม?
  $hasUsername = false;
  $col = $dbh->query("SHOW COLUMNS FROM `user` LIKE 'username'")->fetch();
  if ($col) $hasUsername = true;

  $fields = "id, email, fname, lname, password_hash, role, avatar";
  if ($hasUsername) $fields .= ", username";

  $where  = $hasUsername
          ? "(username = :acc OR email = :acc)"
          : "email = :acc";

  $sql = "SELECT $fields FROM `user` WHERE $where LIMIT 1";
  $stmt = $dbh->prepare($sql);
  $stmt->execute([':acc' => $account]);
  $u = $stmt->fetch();

  if (!$u || !password_verify($password, $u['password_hash'])) {
    json_err("BAD_CREDENTIALS","invalid_credential", 401);
  }

  $_SESSION['user_id'] = (int)$u['id'];
  $_SESSION['role']    = $u['role'] ?? 'user';

  unset($u['password_hash']);
  json_ok($u);

} catch (Throwable $e) {
  json_err("DB_ERROR","db_error", 500);
}
