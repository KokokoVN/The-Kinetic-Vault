const fs = require('fs');

const fixValidation = () => {
  const file = 'stitch/components/inventory-excel-import.tsx';
  let content = fs.readFileSync(file, 'utf8');

  const newFunction = `  const handleRowChange = (index: number, field: keyof ExcelRowDto, value: any) => {
    const newRows = [...rows];
    let updatedRow = { ...newRows[index], [field]: value };

    // Basic auto validation based on field changes
    let errors = updatedRow.errorMessages ? [...updatedRow.errorMessages] : [];
    
    if (field === "quantity") {
      if (Number(value) > 0) {
        errors = errors.filter(e => !e.toLowerCase().includes("số lượng"));
      } else if (!errors.some(e => e.toLowerCase().includes("số lượng"))) {
        errors.push("Số lượng phải lớn hơn 0");
      }
    }
    
    if (field === "unitCost") {
      if (Number(value) >= 0) {
        errors = errors.filter(e => !e.toLowerCase().includes("giá") && !e.toLowerCase().includes("âm"));
      } else if (!errors.some(e => e.toLowerCase().includes("giá") || e.toLowerCase().includes("âm"))) {
        errors.push("Giá nhập không được âm");
      }
    }

    updatedRow.errorMessages = errors;
    updatedRow.valid = errors.length === 0;
    
    newRows[index] = updatedRow;
    setRows(newRows);
  };`;

  // Find the exact old function string to replace
  const oldFunctionMatch = content.match(/const handleRowChange = \(index: number, field: keyof ExcelRowDto, value: any\) => \{\s+const newRows = \[\.\.\.rows\];\s+newRows\[index\] = \{ \.\.\.newRows\[index\], \[field\]: value \};\s+setRows\(newRows\);\s+\};/);
  
  if (oldFunctionMatch) {
    content = content.replace(oldFunctionMatch[0], newFunction);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed', file);
  } else {
    console.log('Function not found!');
  }
}

fixValidation();
