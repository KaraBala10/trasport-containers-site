# PowerShell script to run Django management commands inside Docker container
# Usage: .\docker-manage.ps1 <command> [args]
# Example: .\docker-manage.ps1 migrate
# Example: .\docker-manage.ps1 createsuperuser

param(
    [Parameter(Mandatory=$true)]
    [string]$Command,
    
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$Args
)

$fullCommand = "python manage.py $Command"
if ($Args) {
    $fullCommand += " " + ($Args -join " ")
}

docker-compose exec backend sh -c $fullCommand

