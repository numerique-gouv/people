import datetime
import os
import subprocess
import sys

def run_command(cmd, msg=None, shell=False, cwd='.', stdout=None):
    if msg is None:
        msg = f"# Running: {cmd}"
    if stdout is not None:
        stdout.write(msg + '\n')
        if stdout != sys.stdout:
            print(msg)
    subprocess.check_call(cmd, shell=shell, cwd=cwd, stdout=stdout, stderr=stdout)
    if stdout is not None:
        stdout.flush()


def update_all_file_version(release):
    # pyproject.toml
    print("Update pyproject.toml...")
    path = "src/backend/pyproject.toml"
    with open(path, 'r') as file:
        lines = file.readlines()
        for index, line in enumerate(lines):
            if line.startswith("version = "):
                last_release = line.split("=")[-1]
                new_line = line.replace(last_release, f' "{release}"\n')
                lines[index] = new_line
    with open(path, 'w+') as file:
        file.writelines(lines)

    # helm files
    print("Update helm files...")
    for env in ["preprod", "production"]:
        path = f"src/helm/env.d/{env}/values.desk.yaml.gotmpl"
        with open(path, 'r') as file:
            lines = file.readlines()
            for index, line in enumerate(lines):
                if line.startswith("  tag: "):
                    lines[index] = f'  tag: "v{release}"\n'
        with open(path, 'w+') as file:
            file.writelines(lines)

    # frontend package.json
    print("Update package.json...")
    files_to_modify = []
    filename = "package.json"
    for root, _dir, files in os.walk("src/frontend"):
        if filename in files and "node_modules" not in root and ".next" not in root:
            files_to_modify.append(os.path.join(root, filename))

    for path in files_to_modify:
        with open(path, 'r') as file:
            lines = file.readlines()
            for index, line in enumerate(lines):
                if line.startswith('  "version": '):
                    lines[index] = f'  "version": "{release}"\n'
        with open(path, 'w+') as file:
            file.writelines(lines)
    return

def tag_release(release):
    return

def update_changelog_with_release_info(path, release):
    """...
    """
    print("Update CHANGELOG...")
    with open(path, 'r') as file:
        lines = file.readlines()
        for index, line in enumerate(lines):
            if "## [Unreleased]" in line:
                today = datetime.date.today()
                lines.insert(index + 1, f"\n## [{release}] - {today}\n")
            if line.startswith("[unreleased]"):
                last_release = lines[index + 1].split("]")[0][1:]
                new_unreleased_line = line.replace(last_release, release)
                new_release_line = lines[index + 1].replace(last_release, release)
                lines[index] = new_unreleased_line
                # last_comparison = lines[index + 1]
                # new = last_comparison.replace(last_release, release)
                # release_line = "/".join([*new.split("/")[:-1], f"v{last_release}...v{release}\n"])
                lines.insert(index + 1, new_release_line)
                break

    with open(path, 'w+') as file:
        file.writelines(lines)


if __name__ == "__main__":
    print('Enter your release version:')
    release = input()
    run_command("git checkout deployment", shell=True)
    update_changelog_with_release_info("CHANGELOG.md", release)
    update_all_file_version(release)
    run_command("git add CHANGELOG.md", shell=True)
    run_command("git add src/", shell=True)
    run_command(f"git ci -m '🔖(release) Release version v{release}\nUpdate all version files and changelog'", shell=True)
