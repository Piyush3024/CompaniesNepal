# CompaniesNepal

CompaniesNepal

🏢 Company and User Management API Documentation

This API enables CRUD operations for companies and users, along with additional functionalities such as filtering companies by area, toggling premium or blocked status, and fetching premium or blocked companies. Built with Node.js, Express, and Prisma ORM, it ensures secure and efficient management of data.

📦 Base URL

http://localhost:5000

📋 Endpoints

🧑 User Endpoints

1. 📥 Fetch All Users

Method: GET

Endpoint: /users

Description: Fetches a list of all users.

Middleware: None

Success Response:

Code: 200

Content:

{
"message": "Users fetched",
"users": [
{
"id": 1,
"username": "john_doe",
"email": "john@example.com",
"phone": "1234567890",
"profile_picture": "http://example.com/profile.jpg"
}
]
}

Error Response:

Code: 404

{ "error": "There is no user" }

Code: 500

{ "error": "Internal server error" }

2. ➕ Create a User

Method: POST

Endpoint: /users/:id

Description: Creates a new user with hashed password.

Middleware: isSameUser

Request Body:

{
"username": "john_doe",
"email": "john@example.com",
"password": "password123",
"phone": "1234567890",
"profile_picture": "http://example.com/profile.jpg"
}

Success Response:

Code: 200

Content:

{
"message": "user created",
"newUser": {
"id": 1,
"username": "john_doe",
"email": "john@example.com",
"phone": "1234567890",
"profile_picture": "http://example.com/profile.jpg"
}
}

Error Response:

Code: 400

{ "error": "email, password and username are required", "success": false }

Code: 400

{ "error": "User with this email already exists", "success": false }

Code: 500

{ "error": "Internal server error" }

3. 🗑️ Delete a User

Method: DELETE

Endpoint: /users/:id

Description: Deletes a user by ID.

Middleware: verifyToken, isSameUser

Success Response:

Code: 200

Content:

{ "message": "user deleted" }

Error Response:

Code: 500

{ "error": "Internal server error" }

4. ✏️ Update a User

Method: PATCH

Endpoint: /users/update/:id

Description: Updates user details by ID.

Request Body:

{
"username": "john_doe_updated",
"email": "john_updated@example.com",
"phone": "0987654321",
"profile_picture": "http://example.com/new_profile.jpg"
}

Success Response:

Code: 200

Content:

{
"message": "user is updated",
"editUser": {
"id": 1,
"username": "john_doe_updated",
"email": "john_updated@example.com",
"phone": "0987654321",
"profile_picture": "http://example.com/new_profile.jpg"
}
}

Error Response:

Code: 404

{ "error": "user does not exist" }

Code: 500

{ "error": "Internal server error" }

🏢 Company Endpoints

1. 📥 Fetch All Companies

Method: GET

Endpoint: /companies

Description: Fetches a list of all companies.

Middleware: None

Success Response:

Code: 200

Content:

{
"message": "Companies fetched",
"companies": [
{
"id": "hashed_id_1",
"name": "ABC Corp",
"email": "contact@abccorp.com",
"area_id": "hashed_area_id",
"is_premium": true,
"is_blocked": false
}
]
}

Error Response:

Code: 404

{ "error": "there is no company" }

Code: 500

{ "error": "Internal server error" }

2. ➕ Create a Company

Method: POST

Endpoint: /companies/create

Description: Creates a new company with hashed IDs.

Middleware: verifyToken, authorizeRoles("seller", "admin")

Request Body:

{
"name": "ABC Corp",
"email": "contact@abccorp.com",
"phone": "1234567890",
"website": "http://abccorp.com",
"logo_url": "http://abccorp.com/logo.jpg",
"area_id": 1,
"company_type_id": 1,
"fax": "123-456-7890",
"description": "A leading tech company",
"documents_url": "http://abccorp.com/docs",
"established_year": 2020,
"social_media_links": ["http://twitter.com/abccorp"],
"verification_status_id": 1
}

Success Response:

Code: 200

Content:

{
"message": "company created",
"newCompany": {
"id": "hashed_id_1",
"name": "ABC Corp",
"email": "contact@abccorp.com",
"areas": { "id": "hashed_area_id", "city_id": "hashed_city_id" },
"company_type": { "id": "hashed_type_id" }
}
}

Error Response:

Code: 400

{ "message": "name and email are required", "success": false }

Code: 400

{ "message": "company with this email already exists", "success": false }

Code: 400

{ "message": "area_id and company_type_id are required" }

Code: 500

{ "message": "Internal server error", "success": false }

3. 📄 Fetch a Single Company

Method: GET

Endpoint: /companies/:id

Description: Fetches a single company by its hashed ID.

Middleware: None

Success Response:

Code: 200

Content:

{
"message": "Single Company fetched",
"company": {
"id": "hashed_id_1",
"name": "ABC Corp",
"email": "contact@abccorp.com",
"is_premium": true,
"is_blocked": false
}
}

Error Response:

Code: 404

{ "error": "company not found" }

Code: 500

{ "error": "Internal server error" }

4. 🗑️ Delete a Company

Method: DELETE

Endpoint: /companies/delete/:id

Description: Deletes a company by its hashed ID.

Middleware: verifyToken, authorizeRoles("seller", "admin")

Success Response:

Code: 200

Content:

{ "message": "company deleted", "success": true }

Error Response:

Code: 404

{ "error": "company not found", "success": false }

Code: 500

{ "error": "Internal server error" }

5. ✏️ Update a Company

Method: PATCH

Endpoint: /companies/update/:id

Description: Updates a company by its hashed ID.

Middleware: verifyToken, authorizeRoles("seller", "admin")

Request Body:

{
"name": "ABC Corp Updated",
"email": "newcontact@abccorp.com",
"phone": "0987654321"
}

Success Response:

Code: 200

Content:

{
"message": "company is updated",
"editcompany": {
"id": "hashed_id_1",
"name": "ABC Corp Updated",
"email": "newcontact@abccorp.com",
"areas": { "id": "hashed_area_id" },
"company_type": { "id": "hashed_type_id" }
}
}

Error Response:

Code: 404

{ "error": "company with this email already exists" }

Code: 500

{ "error": "Internal server error" }

6. 📍 Fetch Companies by Area

Method: GET

Endpoint: /companies/areas/:areaId

Description: Fetches all companies in a specific area.

Middleware: None

Success Response:

Code: 200

Content:

{
"success": true,
"message": "Company area fetched successfully",
"data": {
"companies": [
{
"id": "hashed_id_1",
"name": "ABC Corp",
"area_id": "hashed_area_id"
}
],
"areaId": "hashed_area_id"
},
"count": 1
}

Error Response:

Code: 404

{ "error": "No companies found for this area" }

Code: 500

{ "error": "Internal server error" }

7. ⭐ Fetch Premium Companies

Method: GET

Endpoint: /companies/premium-companies

Description: Fetches all premium companies.

Middleware: None

Success Response:

Code: 200

Content:

{
"success": true,
"message": "Premium companies fetched successfully",
"data": [
{
"id": "hashed_id_1",
"name": "ABC Corp",
"is_premium": true
}
]
}

Error Response:

Code: 404

{ "error": "No premium companies found" }

Code: 500

{ "error": "Internal server error" }

8. 🚫 Fetch Blocked Companies

Method: GET

Endpoint: /companies/blocked-companies

Description: Fetches all blocked companies.

Middleware: None

Success Response:

Code: 200

Content:

{
"success": true,
"message": "Blocked companies fetched successfully",
"data": [
{
"id": "hashed_id_1",
"name": "XYZ Corp",
"is_blocked": true
}
]
}

Error Response:

Code: 404

{ "error": "No blocked companies found" }

Code: 500

{ "error": "Internal server error" }

9. 🔄 Toggle Premium Status

Method: PATCH

Endpoint: /companies/toggle-premium/:id

Description: Toggles the premium status of a company.

Middleware: verifyToken, authorizeRoles("admin")

Success Response:

Code: 200

Content:

{
"success": true,
"message": "Company true updated successfully",
"data": {
"id": "hashed_id_1",
"name": "ABC Corp",
"is_premium": true
}
}

Error Response:

Code: 404

{ "error": "Company not found" }

Code: 500

{ "error": "Internal server error" }

10. 🔄 Toggle Blocked Status

Method: PATCH

Endpoint: /companies/toggle-blocked/:id

Description: Toggles the blocked status of a company.

Middleware: verifyToken, authorizeRoles("admin")

Success Response:

Code: 200

Content:

{
"success": true,
"message": "Company false updated successfully",
"data": {
"id": "hashed_id_1",
"name": "ABC Corp",
"is_blocked": false
}
}

Error Response:

Code: 404

{ "error": "Company not found" }

Code: 500

{ "error": "Internal server error" }

🔐 Middleware

verifyToken: Validates JWT tokens for authenticated routes.

isSameUser: Ensures the requesting user matches the target user ID (used in user routes).

authorizeRoles: Restricts access to specified roles (e.g., seller, admin) for company routes.

🚨 Error Handling

400 Bad Request: Missing required fields or duplicate email.

404 Not Found: Resource (user or company) not found.

500 Internal Server Error: Server-side errors with descriptive messages.

📦 Dependencies

@prisma/client: Prisma ORM for database operations

bcrypt: For password hashing

express: Web framework for routing

Custom utility (randomgenerator.js) for ID hashing/decoding

🛠️ Running the Project

Set Up Database:

Configure .env with DATABASE_URL.

Run Prisma migrations:

npx prisma migrate dev

Install Dependencies:

npm install

Start the Server:

npm start

Access API: Use http://localhost:3000 (or your configured port).

🤝 Contributing

Fork the repository.

Create a feature branch:

git checkout -b feature/your-feature

Commit changes:

git commit -m "Add your feature"

Push to the branch:

git push origin feature/your-feature

Open a pull request.

📜 License

This project is licensed under the MIT License.
