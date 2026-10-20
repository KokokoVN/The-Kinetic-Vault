import os

md_path = r"e:\e-commerce-microservices-master\e-commerce-microservices-master\DAC_TA_CSDL_FULL.md"
doc_path = r"e:\e-commerce-microservices-master\e-commerce-microservices-master\Dac_Ta_CSDL_V2.doc"

with open(md_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

html = ["<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>"]
html.append("<head><meta charset='utf-8'><title>Dac Ta CSDL</title></head><body style='font-family: Arial, sans-serif;'>")

in_table = False
is_header = False
row_index = 1

for line in lines:
    line = line.strip()
    if not line:
        html.append("<br>")
        continue
    
    if line.startswith("|"):
        if line.startswith("| :---") or line.startswith("|---"):
            is_header = False
            continue
            
        if not in_table:
            html.append("<table border='1' cellspacing='0' cellpadding='5' style='border-collapse: collapse; width: 100%; margin-bottom: 20px;'>")
            in_table = True
            is_header = True
            row_index = 1
            
        cells = [c.strip() for c in line.split("|")[1:-1]]
        html.append("<tr>")
        
        # Thêm cột STT
        if is_header:
            html.append("<th style='background-color: #f2f2f2; text-align: center; width: 50px;'><b>STT</b></th>")
        else:
            html.append(f"<td style='text-align: center;'>{row_index}</td>")
            row_index += 1
            
        # Thêm các cột còn lại
        for cell in cells:
            if is_header:
                html.append(f"<th style='background-color: #f2f2f2; text-align: left;'><b>{cell}</b></th>")
            else:
                html.append(f"<td>{cell}</td>")
        html.append("</tr>")
        is_header = False
    else:
        if in_table:
            html.append("</table>")
            in_table = False
        
        if line.startswith("## "):
            html.append(f"<h2 style='color: #2c3e50;'>{line[3:]}</h2>")
        elif line.startswith("# "):
            html.append(f"<h1 style='color: #2c3e50;'>{line[2:]}</h1>")
        elif line.startswith("**"):
            html.append(f"<h3 style='color: #e67e22;'>{line.replace('**', '')}</h3>")
        elif line.startswith("---"):
            html.append("<hr>")
        else:
            html.append(f"<p>{line}</p>")

if in_table:
    html.append("</table>")

html.append("</body></html>")

with open(doc_path, 'w', encoding='utf-8') as f:
    f.write("\n".join(html))

print("Updated Dac_Ta_CSDL.doc with STT column successfully!")
