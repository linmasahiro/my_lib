<?php
try {
    $filename = __DIR__ . "/my_data.csv";
    $csv = array_map('str_getcsv', file($filename));
    $handle = fopen($filename, "a+");
    if ($handle) {
        $max_id = 0;
        while (($row = fgetcsv($handle, 1000, ",")) !== false) {
            $max_id = (empty($row[0])) ? $max_id : preg_replace('/^\xEF\xBB\xBF/', '', $row[0]);
        }
        $new_id = $max_id + 1;
        flock($handle, LOCK_EX);
        $type = strtoupper($_POST['type']);
        $title = $_POST['title'];
        $tag = $_POST['tag'];
        $content = htmlspecialchars($_POST['content']);
        fputcsv($handle, [
            $new_id,
            $type,
            $title,
            $tag,
            $content
        ]);
        flock($handle, LOCK_UN);
        echo json_encode([
            'Result' => 'SUCCESS'
        ]);
    } else {
        echo json_encode([
            'Result' => 'ERROR'
        ]);
    }
} catch (Exception $ex) {
    // echo "Exception: {$ex->getMessage()}\n";
    echo json_encode([
        'Result' => 'ERROR'
    ]);
} catch (Error $er) {
    // echo "Error: {$er->getMessage()}\n";
    echo json_encode([
        'Result' => 'ERROR'
    ]);
} finally {
    fclose($handle);
}
?>