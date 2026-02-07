# User Guide - Timeseries Dashboard Platform

This guide will help you understand how to use the Timeseries Dashboard Platform to connect to databases, create data sources, build datasets, and create interactive dashboards with charts.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [User Roles](#user-roles)
4. [Database Connections](#database-connections)
5. [Data Sources](#data-sources)
6. [Data Sets](#data-sets)
7. [Charts](#charts)
8. [Dashboards](#dashboards)
9. [Groups](#groups)
10. [Profile Management](#profile-management)
11. [Tips and Best Practices](#tips-and-best-practices)

---

## Getting Started

### First Login

1. Open the application in your web browser
2. If you don't have an account, click **Register** to create one
3. Fill in the registration form:
   - **Email** (required)
   - **Password** (minimum 6 characters)
   - **First Name** (required)
   - **Last Name** (required)
   - **Middle Name** (optional)
   - **Organization** (optional)
   - **Department** (optional)
4. After registration, you'll be redirected to the login page
5. Log in with your email and password

### Navigation

The main navigation menu is located at the top of the page. Available menu items depend on your user roles:

- **Connections** - Manage database connections (requires `db_admin` role)
- **Data Sources** - Manage data sources (requires `metadata_editor` role)
- **Data Sets** - Manage data sets (requires `metadata_editor` role)
- **Dashboards** - View and manage dashboards (available to all; unauthenticated users see only the list of public dashboards and a **Login** button)
- **Groups** - Manage user groups
- **Users** - Manage users (requires `user_admin` role)
- **Profile** - Edit your profile

**Without logging in** you can open **Dashboards**: the page shows only public dashboards, without the ability to edit or delete them. In the header, instead of the user menu, a **Login** button is displayed.

You can also toggle between light and dark themes using the theme toggle button.

---

## Authentication

### Registration

To create a new account:

1. Click **Register** on the home page
2. Fill in all required fields
3. Ensure passwords match
4. Click **Register**
5. You'll be redirected to the login page

**Note**: New users are created without roles by default. Contact your administrator to assign appropriate roles.

### Login

1. Enter your email and password
2. Click **Sign In**
3. You'll be redirected to the dashboards page if you have access

### Logout

Click on your profile menu (top right) and select **Logout**.

---

## User Roles

The platform uses role-based access control. Different roles have access to different features:

### db_admin
- **Purpose**: Manage database connections
- **Permissions**:
  - Create, edit, and delete database connections
  - Test database connections
  - View database schemas and tables

### metadata_editor
- **Purpose**: Manage data sources and data sets
- **Permissions**:
  - Create, edit, and delete data sources
  - Create, edit, and delete data sets
  - View all data sources and data sets

### dashboard_creator
- **Purpose**: Create and manage dashboards
- **Permissions**:
  - Create, edit, and delete dashboards
  - Create, edit, and delete charts
  - View dashboards you created or have access to

### user_admin
- **Purpose**: Manage users and assign roles
- **Permissions**:
  - View list of users
  - Assign or revoke roles for users

### public
- **Purpose**: View public dashboards
- **Permissions**:
  - View dashboards marked as "public" without authentication

**Note**: Users can have multiple roles. Contact your administrator to request role assignments.

---

## Database Connections

Database connections allow you to connect to external databases (PostgreSQL or ClickHouse) to access time series data.

### Creating a Database Connection

**Required Role**: `db_admin`

1. Navigate to **Connections** in the main menu
2. Click **New Connection**
3. Fill in the connection details:
   - **Name**: A descriptive name for this connection
   - **Type**: Select PostgreSQL or ClickHouse
   - **Host**: Database server hostname or IP address
   - **Port**: Database port (default: 5432 for PostgreSQL, 8123 for ClickHouse)
   - **Database**: Database name
   - **Username**: Database username
   - **Password**: Database password
4. Click **Test Connection** to verify the connection works
5. Click **Save** to create the connection

**Security Note**: Passwords are encrypted before storage for security.

### Editing a Connection

1. Go to **Connections**
2. Click on the connection you want to edit
3. Modify the connection details
4. Click **Test Connection** to verify changes
5. Click **Save**

### Deleting a Connection

1. Go to **Connections**
2. Click on the connection you want to delete
3. Click **Delete**
4. Confirm the deletion

**Warning**: Deleting a connection will affect all data sources that use it.

---

## Data Sources

Data sources represent specific tables from your database connections. They provide the foundation for creating charts.

### Creating Data Sources

**Required Role**: `metadata_editor`

1. Navigate to **Data Sources** in the main menu
2. Click **New Data Source**
3. Select a **Database Connection**
4. The system will load available schemas and tables
5. Select one or more tables from the list
6. Click **Add Selected Tables** to create data sources

The system automatically:
- Detects table columns and their data types
- Identifies timestamp/date columns for time series
- Creates metadata for each selected table

### Viewing Data Sources

1. Go to **Data Sources**
2. You'll see a list of all available data sources
3. Each data source shows:
   - Connection name
   - Schema and table name
   - Description (if set)
   - Number of columns

### Editing Data Sources

1. Go to **Data Sources**
2. Click on a data source to edit
3. You can:
   - Update the description
   - View column information
   - See metadata details

### Deleting Data Sources

1. Go to **Data Sources**
2. Click on the data source you want to delete
3. Click **Delete**
4. Confirm the deletion

**Warning**: Deleting a data source will affect all data sets and charts that use it.

---

## Data Sets

Data sets allow you to combine multiple data sources or configure pre-aggregation for better performance.

### Types of Data Sets

#### Combined Data Sets
Combine multiple data sources or other data sets into a single data set.

#### Pre-aggregated Data Sets
Configure pre-aggregation for data sources to improve query performance on large datasets.

### Creating a Data Set

**Required Role**: `metadata_editor`

1. Navigate to **Data Sets** in the main menu
2. Click **New Data Set**
3. Enter a **Description** (required)
4. Choose the data set type:
   - **Combined**: Select multiple data sources or data sets
   - **Pre-aggregated**: Configure aggregation intervals for data sources
5. For pre-aggregated data sets:
   - Select a data source
   - Set the **Interval** (e.g., 1, 5, 10)
   - Choose the **Time Unit** (seconds, minutes, hours, days)
6. Click **Save**

### Pre-aggregation Configuration

Pre-aggregation helps improve performance by pre-computing aggregated values:

- **Interval**: The time interval for aggregation (e.g., 1, 5, 10)
- **Time Unit**: The unit of time (seconds, minutes, hours, days)

Example: Setting interval to `5` and time unit to `minutes` will aggregate data into 5-minute buckets.

### Editing Data Sets

1. Go to **Data Sets**
2. Click on the data set you want to edit
3. Modify the configuration
4. Click **Save**

### Deleting Data Sets

1. Go to **Data Sets**
2. Click on the data set you want to delete
3. Click **Delete**
4. Confirm the deletion

**Warning**: Deleting a data set will affect all charts that use it.

---

## Charts

Charts are visual representations of your time series data. You can create various types of charts with multiple series and customizable options.

### Chart Types

- **Line**: Continuous line chart (default)
- **Bar**: Bar/column chart
- **Scatter**: Scatter plot
- **Area**: Area chart

### Creating a Chart

**Required Role**: `dashboard_creator`

1. Navigate to a dashboard (create one if needed)
2. Go to the **Charts** tab
3. Click **Add Chart** or **New Chart**
4. Configure the chart:

#### Data Configuration

1. **Select Data Set**: Choose a data set from the dropdown
2. **X-Axis Column**: Select the timestamp/date column
3. **Add Series**: Click **Add Series** to add data series
   - **Y Column**: Select the column to display
   - **Chart Type**: Choose line, bar, scatter, or area
   - **Y-Axis**: Select or create a Y-axis

#### Series Options

For each series, you can configure:

- **Label**: Custom label for the series
- **Mode**: Display mode (lines, markers, lines+markers, text)
- **Line Shape**: Linear, spline, or step patterns
- **Dash Style**: Line style (solid, dashed, dotted, etc.)
- **Line Width**: Thickness of the line
- **Color**: Custom color for the series
- **Marker Options**: Size, color, and symbol for markers
- **Fill Opacity**: For area charts

#### Y-Axis Configuration

1. Click **Add Y-Axis** to create a new axis
2. Configure axis options:
   - **Label**: Axis label
   - **Type**: Linear or logarithmic scale
   - **Title**: Axis title
   - **Min/Max**: Set minimum and maximum values
   - **Position**: Left or right side
   - **Grid Lines**: Enable/disable and configure
   - **Tick Options**: Configure tick marks and labels

#### Chart Options

Configure overall chart appearance:

- **Title**: Chart title
- **Subtitle**: Chart subtitle
- **Description**: Chart description
- **Legend**: Enable/disable and configure position
- **Background**: Chart background color
- **Height**: Chart height in pixels
- **Credits**: Show/hide Highcharts credits

#### X-Axis Options

Configure the time axis:

- **Title**: X-axis title
- **Labels**: Enable/disable and format
- **Grid Lines**: Configure grid lines
- **Date Format**: Customize date/time format

5. Click **Save Chart** to add it to the dashboard

### Editing a Chart

1. Go to the dashboard containing the chart
2. Click on the chart you want to edit
3. Modify the configuration
4. Click **Save Chart**

### Deleting a Chart

1. Go to the dashboard containing the chart
2. Click on the chart you want to delete
3. Click **Delete**
4. Confirm the deletion

### Chart Preview

While editing, you can see a live preview of your chart. The preview updates as you make changes.

---

## Dashboards

Dashboards are collections of charts that provide a comprehensive view of your time series data.

### Creating a Dashboard

**Required Role**: `dashboard_creator`

1. Navigate to **Dashboards** in the main menu
2. Click **New Dashboard**
3. Configure the dashboard:

#### Basic Information

- **Title**: Dashboard title (required)
- **Description**: Optional description
- **Access Level**:
  - **Private**: Only you can view/edit
  - **Shared**: Shared with specific groups
  - **Public**: Anyone can view (no login required)

#### Layout Options

- **Charts Per Row**: Number of charts per row (for grid layout)
- **Layout Type**: Row, column, or grid layout

#### Date Range

- **Default Date Range**: Set a default time range for all charts
- **Show Date Range Picker**: Allow users to change the date range when viewing

#### Groups (for Shared Dashboards)

If you select "Shared" access:
- Select one or more groups
- Choose whether groups have "view" or "edit" permissions

4. Click **Save** to create the dashboard
5. You'll be redirected to add charts

### Adding Charts to a Dashboard

1. Open the dashboard in edit mode
2. Go to the **Charts** tab
3. Click **Add Chart** or **New Chart**
4. Create and configure the chart (see [Charts](#charts) section)
5. The chart will appear on the dashboard

### Viewing a Dashboard

1. Go to **Dashboards**
2. Click on a dashboard to view it
3. If the dashboard has a date range picker, you can:
   - Select a custom date range
   - Use preset ranges (Last 24 hours, Last 7 days, etc.)
4. Charts will update based on the selected date range

### Editing a Dashboard

1. Go to **Dashboards**
2. Click on the dashboard you want to edit
3. Click **Edit**
4. Modify the dashboard settings
5. Click **Save**

**Note**: You can only edit dashboards you created or have edit permissions for.

### Sharing a Dashboard

#### Public Sharing

1. Set the dashboard access to **Public**
2. Anyone with the link can view the dashboard without logging in

**Public dashboard page (standalone view)**  
For embedding or full-screen display without the application header and navigation, use the public URL:

- **URL**: `/dashboards/{dashboard-id}/public`  
  Example: `https://your-app.example/dashboards/507f1f77bcf86cd799439011/public`

- **Behaviour**:
  - The dashboard is shown on the full width of the page, without the platform header, title, or description.
  - Only dashboards with **Public** access open; for others the user is redirected to the dashboards list.
  - **Date range picker** (choice of time interval):
    - If the dashboard is configured with “Show date range picker” disabled, the picker is never shown.
    - Otherwise you can hide it via the query parameter: add `?showDateRange=false` or `?showDateRange=0` to the URL.  
  Example: `/dashboards/507f1f77bcf86cd799439011/public?showDateRange=false`
  - **Theme** (colour scheme): add `?theme=light`, `?theme=dark`, `?theme=light-blue` or `?theme=dark-blue` to force the theme for this view. If omitted, the viewer’s saved theme (or default) is used.  
  Example: `/dashboards/507f1f77bcf86cd799439011/public?theme=dark`

Use this URL in iframes, kiosks, or when you need a minimal view with only the dashboard charts.

#### Group Sharing

1. Set the dashboard access to **Shared**
2. Select one or more groups
3. Choose permissions (view or edit)
4. Members of those groups will have access

### Deleting a Dashboard

1. Go to **Dashboards**
2. Click on the dashboard you want to delete
3. Click **Delete**
4. Confirm the deletion

**Warning**: This will delete all charts in the dashboard.

---

## Groups

Groups allow you to share dashboards with multiple users at once.

### Creating a Group

1. Navigate to **Groups** in the main menu
2. Click **New Group**
3. Fill in the group details:
   - **Name**: Group name (required)
   - **Description**: Group description (required)
   - **Role**: 
     - **View**: Group members can only view shared dashboards
     - **Edit**: Group members can edit shared dashboards
   - **Members**: Select users to add to the group
4. Click **Save**

### Editing a Group

1. Go to **Groups**
2. Click on the group you want to edit
3. Modify the group details
4. Add or remove members
5. Click **Save**

### Deleting a Group

1. Go to **Groups**
2. Click on the group you want to delete
3. Click **Delete**
4. Confirm the deletion

**Note**: Only the group owner can edit or delete a group.

---

## Profile Management

### Viewing Your Profile

1. Click on your profile menu (top right)
2. Select **Profile**

### Editing Your Profile

1. Go to **Profile** → **Edit**
2. Update your information:
   - First Name
   - Last Name
   - Middle Name
   - Organization
   - Department
3. Click **Save**

### Changing Your Password

1. Go to **Profile** → **Edit**
2. Scroll to the **Change Password** section
3. Enter your current password
4. Enter your new password (minimum 6 characters)
5. Confirm the new password
6. Click **Change Password**

---

## Tips and Best Practices

### Database Connections

- **Test connections** before saving to ensure they work
- Use **descriptive names** for connections to easily identify them
- Keep connection credentials secure

### Data Sources

- **Describe your data sources** to make them easier to find
- Use consistent naming conventions
- Review column metadata to understand your data structure

### Data Sets

- Use **pre-aggregation** for large datasets to improve performance
- Choose appropriate **aggregation intervals** based on your data frequency
- Combine related data sources into data sets for easier chart creation

### Charts

- **Use meaningful labels** for series and axes
- **Choose appropriate chart types**:
  - Line charts for continuous time series
  - Bar charts for categorical comparisons
  - Scatter plots for correlation analysis
  - Area charts for cumulative data
- **Configure Y-axes** carefully to ensure data is visible
- **Use colors** to distinguish multiple series
- **Add titles and descriptions** to make charts self-explanatory

### Dashboards

- **Organize charts logically** on your dashboard
- **Set appropriate default date ranges** for your use case
- **Use descriptive titles** and descriptions
- **Test dashboards** before sharing them
- **Consider your audience** when choosing access levels

### Performance

- Use **pre-aggregated data sets** for large time series
- **Limit the number of series** per chart for better performance
- **Set appropriate date ranges** to avoid loading too much data
- **Use filters** to reduce data volume when possible

### Collaboration

- **Create groups** for teams working on similar dashboards
- **Use shared dashboards** for team collaboration
- **Document your data sources** and data sets for other users
- **Use consistent naming conventions** across the platform

### Security

- **Don't share database credentials** outside the platform
- **Use appropriate access levels** for dashboards
- **Review group memberships** regularly
- **Change passwords** periodically

---

## Troubleshooting

### Common Issues

#### Cannot Connect to Database

- Verify connection details (host, port, database name)
- Check network connectivity
- Ensure database credentials are correct
- Verify firewall rules allow connections

#### Charts Not Displaying Data

- Check that the data set contains data for the selected date range
- Verify column selections are correct
- Ensure timestamp columns are properly formatted
- Check that filters aren't excluding all data

#### Performance Issues

- Use pre-aggregated data sets for large datasets
- Reduce the date range
- Limit the number of series per chart
- Check database query performance

#### Access Denied Errors

- Verify you have the required roles
- Check dashboard access settings
- Ensure you're a member of required groups
- Contact your administrator for role assignments

---

## Getting Help

If you encounter issues or need assistance:

1. Check this user guide
2. Contact your system administrator
3. Review error messages for specific guidance
4. Check your user roles and permissions

---

**Last Updated**: February 2026