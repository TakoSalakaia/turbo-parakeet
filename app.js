const createUserUrl = "https://borjomi.loremipsum.ge/api/register";
const getAllUsersUrl = "https://borjomi.loremipsum.ge/api/all-users";
const getSingleUserUrl = "https://borjomi.loremipsum.ge/api/get-user/";
const updateUserUrl = "https://borjomi.loremipsum.ge/api/update-user/";
const deleteUserUrl = "https://borjomi.loremipsum.ge/api/delete-user/";

const regForm = document.querySelector("#registration-form"),
	userName = regForm.querySelector("#user-name"),
	userSurname = regForm.querySelector("#user-surname"),
	userEmail = regForm.querySelector("#user-email"),
	userPhone = regForm.querySelector("#user-phone"),
	userPersonalID = regForm.querySelector("#user-personal-id"),
	userZip = regForm.querySelector("#user-zip-code"),
	userId = document.querySelector("#user-id");

const addNewUserBtn = document.querySelector("#add-new-user"),
	dialogEl = document.querySelector("#user-dialog"),
	closeDialog = document.querySelector("#close");

addNewUserBtn.addEventListener("click", () => {
	regForm.reset();
	userId.value = "";
	dialogEl.style.display = "block";
});

closeDialog.addEventListener("click", () => {
	dialogEl.style.display = "none";
});

function renderUsers(users) {
	const tbody = document.querySelector("#user-body");
	tbody.innerHTML = "";

	users.forEach(user => {
		const tr = document.createElement("tr");
		tr.innerHTML = `
			<td>${user.id}</td>
			<td>${user.first_name}</td>
			<td>${user.last_name}</td>
			<td>${user.email}</td>
			<td>${user.id_number}</td>
			<td>${user.phone}</td>
			<td>${user.zip_code}</td>
			<td>${user.gender}</td>
			<td>
				<button class="edit" data-user-id="${user.id}">Edit</button>
				<button class="delete" data-user-id="${user.id}">Delete</button>
			</td>
		`;
		tbody.appendChild(tr);
	});

	userActions();
}

async function getUsers() {
	try {
		const res = await fetch(getAllUsersUrl);
		const data = await res.json();
		renderUsers(data.users);
	} catch (err) {
		console.error("Fetch error", err);
	}
}

async function getSingleUser(id) {
	try {
		const res = await fetch(getSingleUserUrl + id);
		if (!res.ok) {
			throw new Error("User not found");
		}
		const data = await res.json();
		console.log("Single user data for ID", id, "→", data);
		return data;
	} catch (e) {
		console.error("Error fetching single user:", e);
	}
}

function sendUserData(userDataObject) {
	fetch(createUserUrl, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(userDataObject),
	})
		.then(res => res.json())
		.then(() => {
			getUsers();
			dialogEl.style.display = "none";
		})
		.catch(err => console.error("Error creating user:", err));
}

function deleteUser(id) {
	fetch(deleteUserUrl + id, { method: "DELETE" })
		.then(res => res.json())
		.then(() => getUsers())
		.catch(err => console.error("Error deleting user:", err));
}

function updateUser(userObj) {
	fetch(updateUserUrl + userObj.id, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(userObj),
	})
		.then(res => res.json())
		.then(() => {
			getUsers();
			dialogEl.style.display = "none";
		})
		.catch(err => console.error("Error updating user:", err));
}

function userActions() {
	document.querySelectorAll(".delete").forEach(btn => {
		btn.addEventListener("click", () => {
			const id = btn.dataset.userId;
			deleteUser(id);
		});
	});

	document.querySelectorAll(".edit").forEach(btn => {
		btn.addEventListener("click", async () => {
			const id = btn.dataset.userId;
			console.log("Edit clicked:", id);

			try {
				const response = await getSingleUser(id);
				if (!response || !response.users) {
					alert("მომხმარებელი ვერ მოიძებნა.");
					return;
				}

				const user = response.users;

				userName.value = user.first_name || "";
				userSurname.value = user.last_name || "";
				userEmail.value = user.email || "";
				userPhone.value = user.phone || "";
				userPersonalID.value = user.id_number || "";
				userZip.value = user.zip_code || "";

				const genderRadio = regForm.querySelector(`[name="gender"][value="${user.gender}"]`);
				if (genderRadio) genderRadio.checked = true;

				userId.value = user.id;
				dialogEl.style.display = "block";
			} catch (err) {
				console.error("Error loading user for edit:", err);
			}
		});
	});
}

regForm.addEventListener("submit", e => {
	e.preventDefault();

	const genderEl = regForm.querySelector("[name='gender']:checked");
	if (!genderEl) return alert("Please select a gender.");

	const userData = {
		first_name: userName.value.trim(),
		last_name: userSurname.value.trim(),
		phone: userPhone.value.trim(),
		id_number: userPersonalID.value.trim(),
		email: userEmail.value.trim(),
		gender: genderEl.value,
		zip_code: userZip.value.trim(),
	};

	if (userId.value) {
		userData.id = userId.value;
		updateUser(userData);
	} else {
		sendUserData(userData);
	}
});

getUsers();

setInterval(() => {
	for (let i = 0; i < 5; i++) {
		const heart = document.createElement("div");
		heart.className = "heart";
		heart.innerText = "💖";
		heart.style.left = Math.random() * 100 + "vw";
		document.body.appendChild(heart);
		setTimeout(() => heart.remove(), 3000);
	}
}, 300);
