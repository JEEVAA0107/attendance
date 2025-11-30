$file = "src/pages/Students.tsx"
$content = Get-Content $file -Raw

# Fix line 49 - add safety check in loadStudents sort
$content = $content -replace 'setStudentsList\(loadedStudents\.sort\(\(a, b\) => a\.rollNumber\.localeCompare\(b\.rollNumber, undefined, \{ numeric: true \}\)\)\);', 'setStudentsList(loadedStudents.sort((a, b) => (a.rollNumber || '''').localeCompare(b.rollNumber || '''', undefined, { numeric: true })));'

Set-Content $file -Value $content -NoNewline
Write-Host "Fixed loadStudents rollNumber safety check"
