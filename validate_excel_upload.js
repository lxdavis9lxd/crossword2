// Excel Upload Validation Script
// This script verifies that the Excel validation logic in admin.js will work correctly

const path = require('path');
const fs = require('fs');

console.log('== Excel Upload Validation Test ==');

// Function to simulate the multer file filter logic
function testFileFilter(filename, mimetype) {
    console.log(`\nTesting file: ${filename} (MIME: ${mimetype})`);
    
    // Extract extension logic from admin.js
    const extname = path.extname(filename).toLowerCase();
    const filetypes = /^\.xlsx$|^\.xls$/i;
    const isValidExt = filetypes.test(extname);
    
    // MIME type validation logic from admin.js
    const validMimeTypes = [
        'application/vnd.ms-excel',                                     // .xls
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/msexcel',                                         // alternative
        'application/x-msexcel',                                       // alternative
        'application/x-ms-excel',                                      // alternative
        'application/x-excel',                                         // alternative
        'application/x-dos_ms_excel',                                  // alternative
        'application/xls',                                             // alternative
        'application/x-xls',                                           // alternative
        'application/vnd.ms-excel.sheet.macroEnabled.12',              // .xlsm
        'application/vnd.ms-excel.sheet.binary.macroEnabled.12',       // .xlsb
        'application/vnd.oasis.opendocument.spreadsheet',              // .ods
        'application/octet-stream'                                     // generic binary
    ];
    
    const isValidMime = validMimeTypes.includes(mimetype) || 
                      mimetype.includes('excel') || 
                      mimetype.includes('spreadsheet');
    
    console.log(`Extension: ${extname}`);
    console.log(`Valid extension? ${isValidExt}`);
    console.log(`Valid MIME type? ${isValidMime}`);
    
    // Final validation decision - based on our updated logic
    const isAccepted = isValidExt;
    console.log(`File would be ${isAccepted ? 'ACCEPTED ✅' : 'REJECTED ❌'}`);
    
    return {
        filename,
        mimetype,
        extname,
        isValidExt,
        isValidMime,
        isAccepted
    };
}

// Test various file types and MIME type combinations
const testCases = [
    { filename: 'puzzles.xlsx', mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
    { filename: 'puzzles.xls', mimetype: 'application/vnd.ms-excel' },
    { filename: 'puzzles.xlsx', mimetype: 'application/octet-stream' },
    { filename: 'puzzles.xls', mimetype: 'application/octet-stream' },
    { filename: 'puzzles.xlsx', mimetype: 'application/x-msexcel' },
    { filename: 'puzzles.xls', mimetype: 'application/msexcel' },
    { filename: 'puzzles.xlsx', mimetype: 'binary/octet-stream' },     // Should accept due to extension
    { filename: 'puzzles.xlsxs', mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }, // Should reject due to bad extension
    { filename: 'puzzles.doc', mimetype: 'application/msword' },       // Should reject
    { filename: 'puzzles.pdf', mimetype: 'application/pdf' },          // Should reject
    { filename: 'puzzles.txt', mimetype: 'text/plain' },               // Should reject
    { filename: 'puzzles', mimetype: 'application/vnd.ms-excel' }      // Should reject due to no extension
];

// Run all test cases
const results = [];
for (const testCase of testCases) {
    results.push(testFileFilter(testCase.filename, testCase.mimetype));
}

// Summarize results
console.log('\n== Summary ==');
console.log(`Total test cases: ${results.length}`);
console.log(`Accepted: ${results.filter(r => r.isAccepted).length}`);
console.log(`Rejected: ${results.filter(r => !r.isAccepted).length}`);

console.log('\n== Accepted Files ==');
results.filter(r => r.isAccepted).forEach(r => {
    console.log(`✅ ${r.filename} (${r.mimetype})`);
});

console.log('\n== Rejected Files ==');
results.filter(r => !r.isAccepted).forEach(r => {
    console.log(`❌ ${r.filename} (${r.mimetype})`);
});

// Validate against our test files
console.log('\n== Validating Test Files ==');
const testDir = path.join(__dirname, 'temp');
if (fs.existsSync(testDir)) {
    const files = fs.readdirSync(testDir);
    const excelFiles = files.filter(f => f.endsWith('.xlsx') || f.endsWith('.xls'));
    
    console.log(`Found ${excelFiles.length} Excel files in temp directory`);
    
    excelFiles.forEach(file => {
        const filePath = path.join(testDir, file);
        const stats = fs.statSync(filePath);
        console.log(`- ${file} (${Math.round(stats.size / 1024)} KB)`);
        
        // Based on extension, guess mime type
        const ext = path.extname(file).toLowerCase();
        const mime = ext === '.xlsx' 
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            : 'application/vnd.ms-excel';
            
        const result = testFileFilter(file, mime);
        console.log(`  Would be ${result.isAccepted ? 'ACCEPTED ✅' : 'REJECTED ❌'} by upload filter`);
    });
} else {
    console.log('Temp directory not found. Run excel_upload_test.js first to create test files.');
}

console.log('\nValidation test complete!');
