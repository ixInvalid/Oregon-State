# beaver_trees

- **Category:** Web
- **Points:** 125 (Flag 1: 50 pts, Flag 2: 75 pts)
- **Target:** `https://beaver-trees.ctf-league.osusec.org/`
- **Flag Format:** `osu{...}`

## Core Concepts Covered
1. **HTML (Structure & Source Inspection):** How pages expose elements, hidden modals, and client-side logic.
2. **JavaScript (Client-Side Interactivity):** How forms validate credentials on the frontend before sending network requests.
3. **Network Requests (Browser-to-Server Communication):** Intercepting and modifying HTTP `GET` and `POST` payloads using browser Developer Tools.

---

## Challenge Overview
We are presented with a  shop site ("BeaverTrees Nursery") selling trees to beavers:
- Starting Wallet balance: `$250.0`
- Available items:
  - *Apple Tree*: `$45.00`
  - *Blue Spruce*: `$60.00`
  - *Flag Tree*: `$1,000,000.00` (far exceeding our wallet balance)
- An **Admin Login** button is visible in the top header.

---

## Part 1: Flag 1 — Client-Side Credential Disclosure (50 pts)

### 1. Inspecting the Source Code
Viewing the page source  reveals embedded JavaScript controlling the admin login modal:

```javascript
function handleAdminLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'Admin' && password === 'Tr33_L0V3r!') {
        fetch("/login", {
            method: "POST",
            body: JSON.stringify({
                username: username,
                password: password
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
        .then(response => {
            window.location.reload();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred during login.');
        });
    } else {
        alert('Invalid credentials.');
    }
}
```

### 2. Exploitation
1. Credentials are hardcoded directly into the client-side script:
   - **Username:** `Admin`
   - **Password:** `Tr33_L0V3r!`
2. Click **Admin Login**, supply those credentials, and submit the form.
3. Upon reload, the admin interface displays **Flag 1**.

Flag 1
`osu{Tr33S3D_70_M33t_y0U}`

---

## Part 2: Flag 2 — Parameter Tampering via Network Modification (75 pts)

### 1. Identifying the Vulnerability
Shop features a **Flag Tree** costing `$1,000,000.00`, but the starting wallet only holds `$250.0`. Purchasing items executes logic through `/static/purchase.js`.

Client-side checks attempt to prevent transactions exceeding `$250.0`, but financial decisions must be validated server-side. Since the browser is completely under the user's control, outgoing HTTP requests can be modified before reaching the backend.

### 2. Intercepting & Modifying in Firefox
1. Open Firefox Developer Tools (`F12` or `Ctrl + Shift + I`) and switch to the **Network** tab.
2. Attempt to purchase an item (e.g., Apple Tree or Flag Tree).
3. Find the outgoing `POST` request sent to the checkout/purchase endpoint.
4. Right-click the request and select **Edit and Resend**:
   - **Method A (Price Tampering):** Change the request body price parameter from `1000000.00` to `0.00` or a negative amount.
   - **Method B (Item ID Swap):** Purchase an affordable tree (`$45.00`) and replace the item payload/identifier with the Flag Tree identifier.
5. Click **Send**.
6. Inspect the server response to retrieve **Flag 2**.

Flag 2
`osu{r3A1_7r33_HU663r}`