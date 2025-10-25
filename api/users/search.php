<?php
// api/users/search.php

// ---- CORS & JSON ----
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit();
}

// Method guard
if ($_SERVER["REQUEST_METHOD"] !== "GET") {
  http_response_code(405);
  echo json_encode(['status' => 'error', 'message' => 'method_not_allowed']);
  exit();
}

require_once __DIR__ . '/../db.php'; // path ถูกต้องกับโครงของคุณ
// รองรับทั้ง $pdo/$dbh
if (!isset($dbh) && isset($pdo)) { $dbh = $pdo; }

try {
  // รับพารามิเตอร์ (อ่านจาก GET เป็นหลัก; เผื่อ client ส่ง JSON มาด้วย)
  $rawBody  = file_get_contents("php://input");
  $jsonBody = json_decode($rawBody, true);

  $id = null;
  if (isset($_GET['id']) && $_GET['id'] !== '') {
    $id = trim($_GET['id']);
  } elseif (isset($jsonBody['id']) && $jsonBody['id'] !== '') {
    $id = trim($jsonBody['id']);
  }

  $keyword = '';
  if (isset($_GET['keyword'])) {
    $keyword = trim($_GET['keyword']);
  } elseif (isset($jsonBody['keyword'])) {
    $keyword = trim($jsonBody['keyword']);
  }

  // เคส 1: มี id และไม่ส่ง keyword → คืนรายการเดียวตาม id (เป็น array เสมอ)
  if ($id !== null && $keyword === '') {
    if (!ctype_digit((string)$id)) {
      http_response_code(400);
      echo json_encode(['status' => 'error', 'message' => 'invalid_id']);
      exit();
    }

    $stmt = $dbh->prepare("SELECT id, fname, lname, avatar FROM user WHERE id = :id");
    $stmt->bindValue(':id', (int)$id, PDO::PARAM_INT);
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    $data = [];
    if ($row) {
      $data[] = [
        'id'     => (int)$row['id'],
        'fname'  => $row['fname'],
        'lname'  => $row['lname'],
        'avatar' => $row['avatar'],
      ];
    }

    echo json_encode(['status' => 'ok', 'data' => $data], JSON_UNESCAPED_UNICODE);
    $dbh = null;
    exit();
  }

  // เคส 2: มี keyword → ค้นหา like (และถ้าเป็นตัวเลขล้วน จะลอง match id ตรงด้วย)
  if ($keyword !== '') {
    $isNumeric = ctype_digit($keyword);

    $conds = [];
    if ($isNumeric) {
      $conds[] = "id = :id_eq";
    }
    $conds[] = "(fname LIKE :kw OR lname LIKE :kw)";
    // ถ้าต้องการค้น email ด้วย ให้เพิ่ม:  OR email LIKE :kw

    $sql = "SELECT id, fname, lname, avatar FROM user WHERE "
         . implode(" OR ", $conds)
         . " ORDER BY id ASC";

    $stmt = $dbh->prepare($sql);
    if ($isNumeric) {
      $stmt->bindValue(':id_eq', (int)$keyword, PDO::PARAM_INT);
    }
    $like = '%' . $keyword . '%';
    $stmt->bindValue(':kw', $like, PDO::PARAM_STR);

    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $data = array_map(function($r) {
      return [
        'id'     => (int)$r['id'],
        'fname'  => $r['fname'],
        'lname'  => $r['lname'],
        'avatar' => $r['avatar'],
      ];
    }, $rows);

    echo json_encode(['status' => 'ok', 'data' => $data], JSON_UNESCAPED_UNICODE);
    $dbh = null;
    exit();
  }

  // เคส 3: ไม่ส่งทั้ง id/keyword → คืนทั้งหมด
  $stmt = $dbh->prepare("SELECT id, fname, lname, avatar FROM user ORDER BY id DESC");
  $stmt->execute();
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

  $data = array_map(function($r) {
    return [
      'id'     => (int)$r['id'],
      'fname'  => $r['fname'],
      'lname'  => $r['lname'],
      'avatar' => $r['avatar'],
    ];
  }, $rows);

  echo json_encode(['status' => 'ok', 'data' => $data], JSON_UNESCAPED_UNICODE);
  $dbh = null;

} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode([
    'status' => 'error',
    'message' => 'server_error',
    // 'debug' => $e->getMessage(), // เปิดเฉพาะตอน dev
  ], JSON_UNESCAPED_UNICODE);
  exit();
}
