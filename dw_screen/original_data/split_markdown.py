import os

def split_markdown(input_file):
    output_dir = os.getcwd()
    # output_dir = os.path.dirname(input_file)
    with open(input_file, 'r') as f:
        lines = f.readlines()

    current_section_filename = None
    section_lines = []

    for line in lines:
        if line.startswith("#"):  # Dedent
                line = line[1:]
        if line.startswith("# "):  # Detect section headers
            if current_section_filename:
                # Write the current section to a file
                write_section(output_dir, current_section_filename, section_lines)
            current_section_filename = line.strip().replace("# ", "").lower().replace(" ", "_") + ".md"
            section_lines = [line.strip()]  # Start the new section with the header
        elif current_section_filename:
            section_lines.append(line.strip())

    # Write the last section
    if current_section_filename and section_lines:
        write_section(output_dir, current_section_filename, section_lines)

def write_section(output_dir, filename, lines):
    while lines[-1] == "":
        lines.pop()
    output_path = os.path.join(output_dir, filename)
    with open(output_path, 'w') as f:
        f.write("\n".join(lines) + "\n")

if __name__ == "__main__":
    input_file = "/Users/eivind/src/slottsfjellet/dw_screen_markdown/originals/aaron_m_sturgill_gm_screen.md"
    split_markdown(input_file)
