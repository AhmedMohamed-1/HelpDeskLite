# Help Desk Hub

create a website called HelpDesk Lite HelpDesk Lite 

Sign in, Sign Up

Internal support ticketing · v1

One place for every internal support request.

Employees submit requests with the information support actually needs. Support staff take ownership and move tickets through a clear workflow. Managers see open work, delays, and who is carrying the load.



Get started

Roles & permissions

Employee

View: only their own tickets

Create: new support requests

Update: nothing after submission

Assign: no

Resolve: no

Support Staff

View: all tickets and details

Create: tickets (own or on behalf)

Update: status, priority, notes

Assign: to self or another support member

Resolve: yes — resolve and close

Manager

View: all tickets plus the insights dashboard

Create: tickets

Update: everything support staff can

Assign: yes, including reassignment

Resolve: yes, plus manage user roles

Ticket workflow

Initial status New · working statuses Assigned, In Progress, On Hold · final status Closed (with Resolved as the pre-closure state).



New



Can move to: Assigned, In Progress, Closed



Assigned



Can move to: In Progress, On Hold, Closed



In Progress



Can move to: On Hold, Resolved, Closed



On Hold



Can move to: In Progress, Closed



Resolved



Can move to: Closed, In Progress



Closed



Final state — no further transitions



Required ticket information

Title



Required · short summary, 5–120 characters



Description



Required · what happened and what was tried



Category



Required · Hardware, Software, Network, Access, Facilities, Other



Priority



Required · Low, Medium, High (drives the SLA)



Submitter & ticket ID



Automatic · captured on submission



Attachments



Out of scope for v1 — links can be pasted in the description



Manager visibility

Open tickets by status

Delayed tickets (past the priority SLA)

Resolved and closed volume

Open workload per support member

Delay thresholds: High 8h, Medium 24h, Low 72h from submission while the ticket is still open.



HelpDesk Lite — internal support ticketing workspace





connect it with Firebase for database and auth with this configuration <script type="module">

  // Import the functions you need from the SDKs you need

  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";

  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-analytics.js";

  // TODO: Add SDKs for Firebase products that you want to use

  // https://firebase.google.com/docs/web/setup#available-libraries



  // Your web app's Firebase configuration

  // For Firebase JS SDK v7.20.0 and later, measurementId is optional

  const firebaseConfig = {

    apiKey: "AIzaSyA5ESqS2tkFch5YjiVkrAz9ZyUmoFQ98XM",

    authDomain: "helpdesklite.firebaseapp.com",

    databaseURL: "https://helpdesklite-default-rtdb.firebaseio.com",

    projectId: "helpdesklite",

    storageBucket: "helpdesklite.firebasestorage.app",

    messagingSenderId: "596416121618",

    appId: "1:596416121618:web:5300f72a1846ccaf3281cb",

    measurementId: "G-56EL8KHQR2"

  };



  // Initialize Firebase

  const app = initializeApp(firebaseConfig);

  const analytics = getAnalytics(app);

</script>

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://helpdesklite.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/35db011f-bb68-44c9-9fc6-b13c2c679fba).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
