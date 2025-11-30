$attendanceFile = "src/pages/Attendance.tsx"
$content = Get-Content $attendanceFile -Raw

# Replace rollNo with rollNumber
$content = $content -replace 'rollNo', 'rollNumber'

# Fix the includes checks with null safety
$content = $content -replace 'const aIsUA = a\.rollNumber\.includes\(''UA''\);', 'const aIsUA = (a.rollNumber || '''').includes(''UA'');'
$content = $content -replace 'const bIsUA = b\.rollNumber\.includes\(''UA''\);', 'const bIsUA = (b.rollNumber || '''').includes(''UA'');'
$content = $content -replace 'const aIsLA = a\.rollNumber\.includes\(''LA''\);', 'const aIsLA = (a.rollNumber || '''').includes(''LA'');'
$content = $content -replace 'const bIsLA = b\.rollNumber\.includes\(''LA''\);', 'const bIsLA = (b.rollNumber || '''').includes(''LA'');'

# Fix any localeCompare calls - simpler approach
$content = $content -replace 'a\.rollNumber\.localeCompare\(b\.rollNumber', '(a.rollNumber || '''').localeCompare(b.rollNumber || ''''
$content = $content -replace 'b\.rollNumber\.localeCompare\(a\.rollNumber', '(b.rollNumber || '''').localeCompare(a.rollNumber || ''''

        Set-Content $attendanceFile -Value $content -NoNewline
        Write-Host "Fixed Attendance.tsx rollNumber issues"
