<?php
/**
 * AmiFresh Sakhi Portal - Database Auto-Installer
 * No phpMyAdmin needed! Upload this file and open in browser to setup MySQL tables.
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

$db_host = 'localhost';
$db_user = 'u789152685_amifresh_sakhi';
$db_pass = 'Amifresh@1234';
$db_name = 'u789152685_sakhi_amifresh';

// Check if .env file exists and parse it
$env_path = __DIR__ . '/.env';
if (file_exists($env_path)) {
    $lines = file($env_path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2) + [NULL, NULL];
        if ($name && $value) {
            $name = trim($name);
            $value = trim($value);
            if ($name === 'DB_HOST') $db_host = $value;
            if ($name === 'DB_USER') $db_user = $value;
            if ($name === 'DB_PASSWORD') $db_pass = $value;
            if ($name === 'DB_NAME') $db_name = $value;
        }
    }
}

echo "<!DOCTYPE html><html><head><title>AmiFresh Database Setup</title>";
echo "<style>body{font-family:sans-serif;background:#0f172a;color:#f8fafc;padding:40px;line-height:1.6;}";
echo ".card{background:#1e293b;padding:30px;border-radius:12px;max-width:700px;margin:auto;box-shadow:0 10px 25px rgba(0,0,0,0.5);}";
echo ".success{color:#4ade80;font-weight:bold;}.error{color:#f87171;font-weight:bold;}.info{color:#38bdf8;}";
echo "pre{background:#020617;padding:15px;border-radius:8px;overflow:auto;} button{background:#16a34a;color:white;padding:12px 24px;border:none;border-radius:6px;font-size:16px;cursor:pointer;font-weight:bold;}";
echo "</style></head><body><div class='card'>";
echo "<h2>🍃 AmiFresh Sakhi - MySQL Installer</h2>";

$conn = @new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    echo "<p class='error'>❌ Database Connection Failed: " . htmlspecialchars($conn->connect_error) . "</p>";
    echo "<p class='info'>Target: host=<b>$db_host</b>, user=<b>$db_user</b>, db=<b>$db_name</b></p>";
    echo "<p>Please ensure the database name and user credentials are created on Hostinger.</p>";
    echo "</div></body></html>";
    exit;
}

echo "<p class='success'>✅ Connected to MySQL database '$db_name' successfully!</p>";

$schema_file = __DIR__ . '/schema.sql';
if (!file_exists($schema_file)) {
    echo "<p class='error'>❌ schema.sql file not found in directory: " . htmlspecialchars(__DIR__) . "</p>";
    echo "</div></body></html>";
    exit;
}

$sql = file_get_contents($schema_file);

if ($conn->multi_query($sql)) {
    do {
        if ($result = $conn->store_result()) {
            $result->free();
        }
    } while ($conn->more_results() && $conn->next_result());
    
    echo "<p class='success'>🎉 All tables and Master Admin created successfully!</p>";
    echo "<hr style='border-color:#334155;' />";
    echo "<h3>Default Admin Login:</h3>";
    echo "<p><b>URL:</b> <a href='/login' style='color:#38bdf8;'>/login</a><br/><b>Email:</b> admin@amifresh.com<br/><b>Login ID:</b> ADMIN001<br/><b>Password:</b> admin123</p>";
    echo "<p style='color:#fbbf24;'>⚠️ <b>Security Notice:</b> Please delete this file (<code>install-db.php</code>) from your server now that setup is complete.</p>";
} else {
    echo "<p class='error'>❌ Error executing schema: " . htmlspecialchars($conn->error) . "</p>";
}

$conn->close();
echo "</div></body></html>";
?>
