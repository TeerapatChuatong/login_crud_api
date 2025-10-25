<?php
require_once __DIR__ . '/../db.php';

if (empty($_SESSION['user_id'])) {
  json_err("UNAUTHENTICATED","unauthenticated",401);
}

$stmt = $dbh->prepare("SELECT id,fname,lname,email,role,avatar,created_at FROM user WHERE id=?");
$stmt->execute([$_SESSION['user_id']]);
$u = $stmt->fetch();
if (!$u) json_err("USER_NOT_FOUND","user_not_found",404);

json_ok($u);
