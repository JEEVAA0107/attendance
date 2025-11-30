$file = "src/pages/Students.tsx"
$content = Get-Content $file -Raw

# Fix line 257 - add safety check for existing students
$content = $content -replace 'const existingrollNumbers = new Set\(existingStudents\.map\(s => s\.rollNumber\.toLowerCase\(\)\)\);', 'const existingrollNumbers = new Set(existingStudents.map(s => (s.rollNumber || '''').toLowerCase()));'

# Fix line 261 - add safety check for uploaded students  
$content = $content -replace '!existingrollNumbers\.has\(student\.rollNumber\.toLowerCase\(\)\)', '!existingrollNumbers.has((student.rollNumber || '''').toLowerCase())'

Set-Content $file -Value $content -NoNewline
Write-Host "Fixed rollNumber safety checks"
