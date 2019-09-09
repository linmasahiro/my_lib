<?php
try {
    $id = $_POST['id'];
    $filename = __DIR__ . "/my_data.csv";
    $handle = fopen($filename, "r");
    $csv = [];
    if ($handle) {
        flock($handle, LOCK_EX);
        while (($row = fgetcsv($handle))) {
            if ($row[0] != $id) {
                array_push($csv, $row);
            }
        }
        flock($handle, LOCK_UN);
        fclose($handle);
    }
    if (!empty($csv)) {
        $handle = fopen($filename, "w");
        if ($handle) {
            flock($handle, LOCK_EX);
            foreach($csv as $row) {
                fputcsv($handle, $row);
            }
            flock($handle, LOCK_UN);
            echo json_encode([
                'Result' => 'SUCCESS'
            ]);
        } else {
            echo json_encode([
                'Result' => 'ERROR'
            ]);
        }
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