import datetime
import os
import subprocess
import sys


RELEASE_KINDS = {'p': 'patch', 'm': 'minor', 'mj': 'major'}

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


def update_files(version):
    """Update all files needed with new release version"""
    # pyproject.toml
    print("Update pyproject.toml...")
    path = "src/backend/pyproject.toml"
    with open(path, 'r') as file:
        lines = file.readlines()
        for index, line in enumerate(lines):
            if line.startswith("version = "):
                last_version = line.split("=")[-1]
                new_line = line.replace(last_version, f' "{version}"\n')
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
                    lines[index] = f'  tag: "v{version}"\n'
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
                    lines[index] = f'  "version": "{version}",\n'
        with open(path, 'w+') as file:
            file.writelines(lines)
    return


def update_changelog(path, version):
    """Update changelog file with release info
    """
    print("Update CHANGELOG...")
    with open(path, 'r') as file:
        lines = file.readlines()
        for index, line in enumerate(lines):
            if "## [Unreleased]" in line:
                today = datetime.date.today()
                lines.insert(index + 1, f"\n## [{version}] - {today}\n")
            if line.startswith("[unreleased]"):
                last_version = lines[index + 1].split("]")[0][1:]
                new_unreleased_line = line.replace(last_version, version)
                new_release_line = lines[index + 1].replace(last_version, version)
                lines[index] = new_unreleased_line
                lines.insert(index + 1, new_release_line)
                break

    with open(path, 'w+') as file:
        file.writelines(lines)


def prepare_release(version, kind):
    print('Let\'s go to create branch to release')
    branch_to_release = f"release/{version}"
    run_command(f"git checkout -b {branch_to_release}", shell=True)
    run_command("git pull --rebase origin main", shell=True)

    update_changelog("CHANGELOG.md", version)
    update_files(version)

    run_command("git add CHANGELOG.md", shell=True)
    run_command("git add src/", shell=True)
    message = f"""🔖({RELEASE_KINDS[kind]}) release version {version}

    Update all version files and changelog for release {RELEASE_KINDS[kind]}."""
    run_command(f"git ci -m '{message}'", shell=True)
    check_ok = input(f"\nNEXT COMMAND: \n>> git push origin {branch_to_release}\nContinue ? (y,n) ")
    if check_ok == 'y':
        run_command(f"git push origin {branch_to_release}", shell=True)
    print(f"""
    PLEASE DO THE FOLLOWING INSTRUCTIONS:
    --> Please submit PR and merge code to main than tag version
    >> git tag -a v{version} 
    >> git push origin v{version} 
    --> Please check docker image: https://hub.docker.com/r/lasuite/people-backend/tags"
    >> git tag -d preprod
    >> git tag preprod
    >> git push -f origin preprod
    --> Now please generate release on github interface for the current tag v{version}"
    """)


if __name__ == "__main__":
    version, kind = None, None
    while not version:
        version = input("Enter your release version:")
    while kind not in RELEASE_KINDS:
        kind = input("Enter kind of release (p:patch, m:minor, mj:major):")
    prepare_release(version, kind)
