# User Guide - Financial Web Application

## Introduction

Welcome to the Financial Web Application for the Locador system. This guide will help you understand how to use all the features of the application to manage your financial operations effectively.

## Getting Started

### Login

1. Open your web browser and navigate to the application URL
2. Enter your username and password
3. Click "Login" to access the system

If you don't have credentials, contact your system administrator.

### Navigation

The application features a sidebar navigation menu on the left side of the screen. From here, you can access all modules:

- **Dashboard**: Financial overview and key indicators
- **Accounts Payable**: Manage supplier payments and obligations
- **Accounts Receivable**: Manage customer receivables
- **Financial Transactions**: Record income and expenses
- **Categories**: Manage financial categories
- **Reports**: Generate financial reports

## Dashboard

The dashboard provides a comprehensive overview of your financial status:

### Financial Summary
- **Total Revenues**: Sum of all confirmed income
- **Total Expenses**: Sum of all confirmed expenses
- **Current Balance**: Difference between revenues and expenses
- **Accounts Payable**: Number of open supplier accounts
- **Accounts Receivable**: Number of open customer accounts

### Cash Flow Chart
Visual representation of monthly cash flow over the past 12 months, showing:
- Monthly revenues (green)
- Monthly expenses (red)
- Monthly balance (blue)

### Top Suppliers/Clients
Lists of top suppliers by payment value and top clients by revenue value.

## Accounts Payable

Manage all your supplier obligations and payments.

### Creating a New Account Payable

1. Click "New Account" in the Accounts Payable section
2. Fill in the required information:
   - **Company**: Your company code
   - **Supplier**: Supplier code
   - **Bank Account**: Bank account for payment (optional)
   - **Category**: Financial category
   - **Issue Date**: Invoice date
   - **Due Date**: Payment due date
   - **Value**: Invoice amount
   - **Document Number**: Invoice number
   - **Installment**: Installment number (for installment payments)
   - **Total Installments**: Total number of installments
   - **Status**: Account status (Open, Paid, Overdue, Cancelled)
   - **Barcode**: Barcode information (optional)
   - **Readable Line**: Readable line information (optional)
   - **Observations**: Additional notes

3. Click "Save" to create the account

### Managing Accounts Payable

#### Filtering
Use the filter controls to find specific accounts:
- **Supplier**: Filter by supplier code
- **Status**: Filter by account status
- **Due Date Range**: Filter by due date period
- **Value Range**: Filter by amount range
- **Company**: Filter by company code

#### Actions
For each account, you can:
- **Edit**: Modify account information
- **Pay**: Register payment for the account
- **Delete**: Cancel the account

### Registering Payments

1. Click the payment icon next to an account
2. Fill in payment details:
   - **Payment Date**: Date of payment
   - **Paid Value**: Amount paid
   - **Bank Account**: Account used for payment
   - **Payment Method**: Payment method code
   - **Discount**: Discount amount (optional)
   - **Interest**: Interest amount (optional)
   - **Fine**: Fine amount (optional)
   - **Document Number**: Payment document number
   - **Observations**: Payment notes

3. Click "Save" to register the payment

## Accounts Receivable

Manage all your customer receivables and collections.

### Creating a New Account Receivable

1. Click "New Account" in the Accounts Receivable section
2. Fill in the required information:
   - **Company**: Your company code
   - **Client**: Client code
   - **Bank Account**: Bank account for collection (optional)
   - **Category**: Financial category
   - **Issue Date**: Invoice date
   - **Due Date**: Payment due date
   - **Value**: Invoice amount
   - **Document Number**: Invoice number
   - **Installment**: Installment number (for installment payments)
   - **Total Installments**: Total number of installments
   - **Days Overdue**: Days past due (calculated automatically)
   - **Protested**: Flag for protested accounts
   - **Protest Date**: Date of protest (if applicable)
   - **Status**: Account status (Open, Received, Overdue, Cancelled)
   - **Invoice Number**: Invoice number
   - **Invoice Series**: Invoice series
   - **Observations**: Additional notes

3. Click "Save" to create the account

### Managing Accounts Receivable

#### Filtering
Use the filter controls to find specific accounts:
- **Client**: Filter by client code
- **Status**: Filter by account status
- **Due Date Range**: Filter by due date period
- **Value Range**: Filter by amount range
- **Company**: Filter by company code

#### Actions
For each account, you can:
- **Edit**: Modify account information
- **Receive**: Register collection for the account
- **Delete**: Cancel the account

### Registering Collections

1. Click the collection icon next to an account
2. Fill in collection details:
   - **Collection Date**: Date of collection
   - **Received Value**: Amount received
   - **Bank Account**: Account used for collection
   - **Payment Method**: Payment method code
   - **Discount**: Discount amount (optional)
   - **Interest**: Interest amount (optional)
   - **Fine**: Fine amount (optional)
   - **Document Number**: Collection document number
   - **Observations**: Collection notes

3. Click "Save" to register the collection

## Financial Transactions

Record all income and expense transactions.

### Creating a New Transaction

1. Navigate to the Financial Transactions section
2. Click "New Transaction"
3. Fill in transaction details:
   - **Company**: Your company code
   - **Type**: Transaction type (Revenue or Expense)
   - **Category**: Financial category
   - **Supplier/Client**: Supplier or client code
   - **Bank Account**: Bank account involved
   - **Payment Method**: Payment method
   - **Date**: Transaction date
   - **Value**: Transaction amount
   - **Document Number**: Document number
   - **Cost Center**: Cost center code (optional)
   - **Project**: Project code (optional)
   - **Confirmed**: Confirmation status
   - **Observations**: Additional notes

4. Click "Save" to record the transaction

## Categories

Organize your financial transactions using categories.

### Category Hierarchy

Categories can be organized in a hierarchical structure:
- Parent categories for main classifications
- Child categories for detailed classifications

### Creating Categories

1. Navigate to the Categories section
2. Click "New Category"
3. Fill in category information:
   - **Name**: Category name
   - **Type**: Category type (Revenue or Expense)
   - **Parent Category**: Parent category (optional)
   - **Active**: Activation status
   - **Description**: Category description

4. Click "Save" to create the category

## Reports

Generate various financial reports to analyze your business performance.

### Available Reports

- **Financial Summary**: Overview of revenues and expenses
- **Cash Flow**: Detailed cash flow analysis
- **Category Analysis**: Breakdown by financial categories
- **Supplier/Client Analysis**: Analysis by suppliers and clients
- **Overdue Accounts**: List of overdue accounts

## User Management

### Profile Settings

Access your profile settings through the user menu in the top right corner:
- **View Profile**: See your user information
- **Logout**: End your session securely

## Best Practices

### Data Entry
- Always verify data before saving
- Use consistent naming conventions
- Fill in all required fields
- Add observations for important details

### Account Management
- Regularly update account statuses
- Process payments/collections promptly
- Monitor overdue accounts
- Keep accurate records

### Security
- Use strong passwords
- Log out when leaving your workstation
- Report any suspicious activity
- Keep your credentials secure

## Troubleshooting

### Common Issues

**Cannot Login**
- Verify your username and password
- Check if your account is active
- Contact your system administrator

**Data Not Loading**
- Check your internet connection
- Refresh the page
- Clear your browser cache

**Error Messages**
- Note the error message
- Try the operation again
- Contact support if the issue persists

### Support

For technical support, contact your system administrator or the development team.

## Glossary

- **Account Payable**: An obligation to pay a supplier
- **Account Receivable**: An amount to be received from a customer
- **Category**: Classification for financial transactions
- **Confirmed**: Transaction that has been validated
- **Overdue**: Account that has passed its due date
- **Installment**: Part of a payment divided into multiple parts

## Version Information

Current Version: 1.0
Release Date: 2025-09-09