# Comprehensive fix for Students.tsx
$file = "src/pages/Students.tsx"
$content = Get-Content $file -Raw

# Step 1: Replace rollNo with rollNumber
$content = $content -replace 'rollNo', 'rollNumber'

# Step 2: Add null safety checks for all rollNumber operations
# Fix includes() calls
$content = $content -replace '([ab])\.rollNumber\.includes\(', '($1.rollNumber || '''').includes('
$content = $content -replace 'student\.rollNumber\.toLowerCase\(\)\.includes\(', '(student.rollNumber || '''').toLowerCase().includes('

# Fix localeCompare() calls  
$content = $content -replace 'a\.rollNumber\.localeCompare\(b\.rollNumber', '(a.rollNumber || '''').localeCompare(b.rollNumber || ''''
$content = $content -replace 'b\.rollNumber\.localeCompare\(a\.rollNumber', '(b.rollNumber || '''').localeCompare(a.rollNumber || ''''

        # Fix map for existing roll numbers
        $content = $content -replace 's\.rollNumber\.toLowerCase\(\)\)\);', '(s.rollNumber || '''').toLowerCase()));'

        # Fix filter for new students
        $content = $content -replace 'student\.rollNumber\.toLowerCase\(\)\)', '(student.rollNumber || '''').toLowerCase())'

        # Step 3: Add filter to skip students with empty roll numbers before insertion
        # Find the studentsToInsert line and add validStudents filter before it
        $pattern = '(\s+)(const studentsToInsert = newStudents\.map)'
        $replacement = '$1// Filter out students with empty roll numbers to avoid duplicate key violations' + "`r`n" + '$1const validStudents = newStudents.filter(student => student.rollNumber && student.rollNumber.trim() !== '''');' + "`r`n" + "`r`n" + '$1if (validStudents.length === 0) {' + "`r`n" + '$1  toast.error(''No valid students to upload (all students are missing roll numbers or are duplicates)'');' + "`r`n" + '$1  return;' + "`r`n" + '$1}' + "`r`n" + "`r`n" + '$1const studentsToInsert = validStudents.map'
        $content = $content -replace $pattern, $replacement

        Set-Content $file -Value $content -NoNewline
        Write-Host "Successfully applied all fixes to Students.tsx"
