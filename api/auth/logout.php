<?php
require_once __DIR__ . '/../db.php';

session_unset();
session_destroy();
json_ok(["message"=>"logged_out"]);
