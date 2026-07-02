#!/bin/bash
# Open all publish pages at once (Mac)
# Run: bash operations/open_all_publish_pages.sh

echo "Opening all publish pages..."

open "https://app.gumroad.com/products/new"
sleep 0.5
open "https://tally.so/forms"
sleep 0.5
open "https://app.brevo.com/contact/list"
sleep 0.5
open "https://www.linkedin.com/in/"
sleep 0.5
open "https://www.threads.net/"

echo ""
echo "5 pages opened:"
echo "  1. Gumroad → New Product"
echo "  2. Tally → My Forms"
echo "  3. Brevo → Contacts"
echo "  4. LinkedIn → Your profile"
echo "  5. Threads → Your profile"
echo ""
echo "Next: Log in to each service, then follow claude_publish_operator.md"
