$file = "src/pages/Students.tsx"
$content = Get-Content $file -Raw

# Fix line 64 - toLowerCase in filter
$content = $content -replace 'student\.rollNumber\.toLowerCase\(\)\.includes\(searchQuery\.toLowerCase\(\)\)', '(student.rollNumber || '''').toLowerCase().includes(searchQuery.toLowerCase())'

# Fix lines 68-71 - includes checks
$content = $content -replace 'const aIsLA = a\.rollNumber\.includes\(''LA''\);', 'const aIsLA = (a.rollNumber || '''').includes(''LA'');'
$content = $content -replace 'const bIsLA = b\.rollNumber\.includes\(''LA''\);', 'const bIsLA = (b.rollNumber || '''').includes(''LA'');'
$content = $content -replace 'const aIsUA = a\.rollNumber\.includes\(''UA''\);', 'const aIsUA = (a.rollNumber || '''').includes(''UA'');'
$content = $content -replace 'const bIsUA = b\.rollNumber\.includes\(''UA''\);', 'const bIsUA = (b.rollNumber || '''').includes(''UA'');'

# Fix lines 78-80 - localeCompare in sort
$content = $content -replace 'return a\.rollNumber\.localeCompare\(b\.rollNumber, undefined, \{ numeric: true \}\);', 'return (a.rollNumber || '''').localeCompare(b.rollNumber || '''', undefined, { numeric: true });'
$content = $content -replace 'return b\.rollNumber\.localeCompare\(a\.rollNumber, undefined, \{ numeric: true \}\);', 'return (b.rollNumber || '''').localeCompare(a.rollNumber || '''', undefined, { numeric: true });'

Set-Content $file -Value $content -NoNewline
Write-Host "Fixed all rollNumber null safety issues"
