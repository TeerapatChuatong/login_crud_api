<?php
require_once __DIR__ . '/../db.php';

if (empty($_SESSION['user_id'])) {
  json_err("UNAUTHENTICATED", "unauthenticated", 401);
}

try {
  $uid = (int)$_SESSION['user_id'];

  $stmt = $dbh->prepare(
    "SELECT id, fname, lname, email, role, avatar, created_at
     FROM `user`
     WHERE id = ? LIMIT 1"
  );
  $stmt->execute([$uid]);
  $u = $stmt->fetch();

  if (!$u) {
    json_err("USER_NOT_FOUND", "user_not_found", 404);
  }

  json_ok($u);

} catch (Throwable $e) {
  // ถ้าต้องการดู error จริงชั่วคราว ตั้ง APP_DEBUG=1 แล้วเปลี่ยนเป็น:
  // json_err("DB_ERROR", $e->getMessage(), 500);
  json_err("DB_ERROR", "db_error", 500);
}
