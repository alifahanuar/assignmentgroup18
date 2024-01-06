<!-- Example HTML form -->
<form id="adminLoginForm">
    <label for="username">Username:</label>
    <input type="text" id="username" name="username" required>

    <label for="password">Password:</label>
    <input type="password" id="password" name="password" required>

    <button type="submit">Login</button>
</form>

<script>
    // Example JavaScript using Fetch API to send login request
    document.getElementById('adminLoginForm').addEventListener('submit', function (event) {
        event.preventDefault();

        const formData = new FormData(event.target);

        fetch('/loginadmin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Object.fromEntries(formData))
        })
            .then(response => response.text())
            .then(data => {
                console.log(data); // Handle the response from the server
            })
            .catch(error => {
                console.error('Error during login:', error);
            });
    });
</script>
