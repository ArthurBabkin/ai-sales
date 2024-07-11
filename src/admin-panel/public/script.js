document.addEventListener("DOMContentLoaded", () => {
	const itemsBtn = document.getElementById("itemsBtn");
	const intentsBtn = document.getElementById("intentsBtn");
	const systemPromptBtn = document.getElementById("systemPromptBtn");
	const adminPanelBtn = document.getElementById("adminPanelBtn");
	const loginForm = document.getElementById("loginForm");
	const itemList = document.getElementById("itemList");
	const intentList = document.getElementById("intentList");
	const systemPrompt = document.getElementById("systemPrompt");
	const classifierPrompt = document.getElementById("classifierPrompt");
	const reminderPrompt = document.getElementById("reminderPrompt");

	if (itemsBtn) {
		itemsBtn.addEventListener("click", (event) => {
			event.preventDefault();
			window.location.href = "/items";
		});
	}

	if (intentsBtn) {
		intentsBtn.addEventListener("click", (event) => {
			event.preventDefault();
			window.location.href = "/intents";
		});
	}

	if (systemPromptBtn) {
		systemPromptBtn.addEventListener("click", (event) => {
			event.preventDefault();
			window.location.href = "/system-prompts";
		});
	}

	if (adminPanelBtn) {
		adminPanelBtn.addEventListener("click", (event) => {
			event.preventDefault();
			window.location.href = "/";
		});
	}

	if (loginForm) {
		loginForm.addEventListener("submit", (event) => {
			event.preventDefault();

			const formData = new FormData(loginForm);
			const formObject = {};
			formData.forEach((value, key) => {
				formObject[key] = value;
			});

			fetch("/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formObject),
			})
				.then((response) => response.json())
				.then((data) => {
					if (data.success) {
						alert("Authentication successful");
						window.location.href = "/";
					} else {
						alert("Authentication failed");
						window.location.href = "/auth";
					}
				});
		});
	}

	if (itemList) {
		fetch("/list-items")
			.then((response) => response.json())
			.then((data) => {
				const items = data.items;
				itemList.innerHTML = "";
				items.sort((a, b) => a.id - b.id);
				for (let i = 0; i < items.length; i++) {
					const item = items[i];
					// Create a form for each item
					const form = document.createElement("form");
					form.className = "form";

					// Item Name
					const nameLabel = document.createElement("label");
					nameLabel.textContent = "Item Name:";
					const nameInput = document.createElement("input");
					nameInput.type = "text";
					nameInput.name = "name";
					nameInput.value = item.name;
					nameInput.required = true;

					// Item Description
					const descLabel = document.createElement("label");
					descLabel.textContent = "Item Description:";
					const descInput = document.createElement("textarea");
					descInput.name = "description";
					descInput.rows = 6;
					descInput.cols = 50;
					descInput.required = true;
					descInput.textContent = item.description;

					// Hidden input to store item ID
					const idInput = document.createElement("input");
					idInput.type = "hidden";
					idInput.name = "id";
					idInput.value = item.id;

					// Submit button
					const updateBtn = document.createElement("input");
					updateBtn.type = "submit";
					updateBtn.value = "Update Item";
					updateBtn.className = "button";

					// Delete button
					const deleteBtn = document.createElement("input");
					deleteBtn.type = "submit";
					deleteBtn.value = "Delete Item";
					deleteBtn.className = "button";

					// Append all elements to the form
					form.appendChild(nameLabel);
					form.appendChild(nameInput);
					form.appendChild(document.createElement("br"));
					form.appendChild(descLabel);
					form.appendChild(document.createElement("br"));
					form.appendChild(descInput);
					form.appendChild(document.createElement("br"));
					form.appendChild(idInput);
					form.appendChild(updateBtn);
					form.appendChild(deleteBtn);

					// Append the form to the item list
					itemList.appendChild(form);

					// Add event listener to handle form submission
					form.addEventListener("submit", (event) => {
						event.preventDefault();
						const formData = new FormData(form);
						const formObject = {};
						formData.forEach((value, key) => {
							formObject[key] = value;
						});

						if (event.submitter === updateBtn) {
							fetch("/update-item", {
								method: "POST",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify(formObject),
							})
								.then((response) => response.json())
								.then((data) => {
									if (data.success) {
										alert("Item updated successfully");
										window.location.reload();
									} else {
										alert("Item update failed");
									}
								})
								.catch((error) => {
									console.error("Error:", error);
									alert("An error occurred. Please try again later.");
								});
						} else if (event.submitter === deleteBtn) {
							fetch("/delete-item", {
								method: "POST",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify({ id: formObject.id }),
							})
								.then((response) => response.json())
								.then((data) => {
									if (data.success) {
										alert("Item deleted successfully");
										window.location.reload();
									} else {
										alert("Item deletion failed");
									}
								})
								.catch((error) => {
									console.error("Error:", error);
									alert("An error occurred. Please try again later.");
								});
						}
					});
				}

				// Create a form for new item
				const form = document.createElement("form");
				form.className = "form";

				// Item Name
				const nameLabel = document.createElement("label");
				nameLabel.textContent = "Item Name:";
				const nameInput = document.createElement("input");
				nameInput.type = "text";
				nameInput.name = "itemName";
				nameInput.required = true;

				// Item Description
				const descLabel = document.createElement("label");
				descLabel.textContent = "Item Description:";
				const descInput = document.createElement("textarea");
				descInput.name = "itemDescription";
				descInput.rows = 6;
				descInput.cols = 50;
				descInput.required = true;

				// Hidden input to store item ID
				const idInput = document.createElement("input");
				idInput.type = "hidden";
				idInput.name = "itemId";
				idInput.value = itemList.length;

				// Submit button
				const submitBtn = document.createElement("input");
				submitBtn.type = "submit";
				submitBtn.value = "Add Item";
				submitBtn.className = "Button";

				// Append all elements to the form
				form.appendChild(nameLabel);
				form.appendChild(nameInput);
				form.appendChild(document.createElement("br"));
				form.appendChild(descLabel);
				form.appendChild(document.createElement("br"));
				form.appendChild(descInput);
				form.appendChild(document.createElement("br"));
				form.appendChild(idInput);
				form.appendChild(submitBtn);

				// Append the form to the item list
				itemList.appendChild(form);

				// Add event listener to handle form submission
				form.addEventListener("submit", (event) => {
					event.preventDefault();

					const formData = new FormData(form);
					const formObject = {};
					formData.forEach((value, key) => {
						formObject[key] = value;
					});

					fetch("/submit-item", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(formObject),
					})
						.then((response) => response.json())
						.then((data) => {
							if (data.success) {
								alert("Item added successfully");
								window.location.reload();
							} else {
								alert("Item add failed");
							}
						})
						.catch((error) => {
							console.error("Error:", error);
							alert("An error occurred. Please try again later.");
						});
				});
			});
	}

	if (intentList) {
		fetch("/list-intents")
			.then((response) => response.json())
			.then((data) => {
				const intents = data.intents;
				intentList.innerHTML = "";
				for (let i = 0; i < intents.length; i++) {
					const intent = intents[i];
					const form = document.createElement("form");
					form.className = "form";

					const nameLabel = document.createElement("label");
					nameLabel.textContent = "Intent Name:";
					const nameInput = document.createElement("input");
					nameInput.type = "text";
					nameInput.name = "intentName";
					nameInput.value = intent.name;
					nameInput.required = true;

					const descLabel = document.createElement("label");
					descLabel.textContent = "Intent Description:";
					const descInput = document.createElement("textarea");
					descInput.name = "intentDescription";
					descInput.rows = 3;
					descInput.cols = 50;
					descInput.required = true;
					descInput.textContent = intent.description;

					// Hidden input to store item ID
					const idInput = document.createElement("input");
					idInput.type = "hidden";
					idInput.name = "intentId";
					idInput.value = intent.id;

					// Submit button
					const updateBtn = document.createElement("input");
					updateBtn.type = "submit";
					updateBtn.value = "Update Intent";
					updateBtn.className = "button";

					// Delete button
					const deleteBtn = document.createElement("input");
					deleteBtn.type = "submit";
					deleteBtn.value = "Delete Intent";
					deleteBtn.className = "button";

					// Append all elements to the form
					form.appendChild(nameLabel);
					form.appendChild(nameInput);
					form.appendChild(document.createElement("br"));
					form.appendChild(descLabel);
					form.appendChild(document.createElement("br"));
					form.appendChild(descInput);
					form.appendChild(document.createElement("br"));
					form.appendChild(idInput);
					form.appendChild(updateBtn);
					form.appendChild(deleteBtn);

					// Append the form to the intent list
					intentList.appendChild(form);

					// Add event listener to handle form submission
					form.addEventListener("submit", (event) => {
						event.preventDefault();
						const formData = new FormData(form);
						const formObject = {};
						formData.forEach((value, key) => {
							formObject[key] = value;
						});

						if (event.submitter === updateBtn) {
							fetch("/update-intent", {
								method: "POST",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify(formObject),
							})
								.then((response) => response.json())
								.then((data) => {
									if (data.success) {
										alert("Intent updated successfully");
										window.location.reload();
									} else {
										alert("Intent update failed");
									}
								})
								.catch((error) => {
									console.error("Error:", error);
									alert("An error occurred. Please try again later.");
								});
						} else if (event.submitter === deleteBtn) {
							fetch("/delete-intent", {
								method: "POST",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify(formObject),
							})
								.then((response) => response.json())
								.then((data) => {
									if (data.success) {
										alert("Intent deleted successfully");
										window.location.reload();
									} else {
										alert("Intent deletion failed");
									}
								})
								.catch((error) => {
									console.error("Error:", error);
									alert("An error occurred. Please try again later.");
								});
						}
					});
				}

				const form = document.createElement("form");
				form.className = "form";

				const nameLabel = document.createElement("label");
				nameLabel.textContent = "Intent Name:";
				const nameInput = document.createElement("input");
				nameInput.type = "text";
				nameInput.name = "intentName";
				nameInput.value = "";
				nameInput.required = true;

				const descLabel = document.createElement("label");
				descLabel.textContent = "Intent Description:";
				const descInput = document.createElement("textarea");
				descInput.name = "intentDescription";
				descInput.rows = 3;
				descInput.cols = 50;
				descInput.required = true;
				descInput.textContent = "";

				// Hidden input to store item ID
				const idInput = document.createElement("input");
				idInput.type = "hidden";
				idInput.name = "intentId";
				idInput.value = intents.length;

				// Submit button
				const submitBtn = document.createElement("input");
				submitBtn.type = "submit";
				submitBtn.value = "Add Intent";
				submitBtn.className = "button";

				// Append all elements to the form
				form.appendChild(nameLabel);
				form.appendChild(nameInput);
				form.appendChild(document.createElement("br"));
				form.appendChild(descLabel);
				form.appendChild(document.createElement("br"));
				form.appendChild(descInput);
				form.appendChild(document.createElement("br"));
				form.appendChild(idInput);
				form.appendChild(submitBtn);

				intentList.appendChild(form);

				// Add event listener to handle form submission
				form.addEventListener("submit", (event) => {
					event.preventDefault();
					const formData = new FormData(form);
					const formObject = {};
					formData.forEach((value, key) => {
						formObject[key] = value;
					});

					fetch("/submit-intent", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(formObject),
					})
						.then((response) => response.json())
						.then((data) => {
							if (data.success) {
								alert("Intent added successfully");
								window.location.reload();
							} else {
								alert("Intent add failed");
							}
						})
						.catch((error) => {
							alert("An error occurred. Please try again later.");
						});
				});
			});
	}

	if (systemPrompt) {
		fetch("/get-system-prompt")
			.then((response) => response.json())
			.then((data) => {
				const form = document.createElement("form");
				form.className = "form";

				const systemPromptLabel = document.createElement("label");
				systemPromptLabel.textContent = "System Prompt:";
				const systemPromptInput = document.createElement("textarea");
				systemPromptInput.name = "prompt";
				systemPromptInput.rows = 20;
				systemPromptInput.cols = 50;
				systemPromptInput.required = true;
				systemPromptInput.value = data.prompt;

				const updateBtn = document.createElement("input");
				updateBtn.type = "submit";
				updateBtn.value = "Update System Prompt";
				updateBtn.className = "button";

				form.appendChild(systemPromptLabel);
				form.appendChild(document.createElement("br"));
				form.appendChild(systemPromptInput);
				form.appendChild(document.createElement("br"));
				form.appendChild(updateBtn);

				systemPrompts.appendChild(form);

				form.addEventListener("submit", (event) => {
					event.preventDefault();
					const formData = new FormData(form);
					const formObject = {};
					formData.forEach((value, key) => {
						formObject[key] = value;
					});

					fetch("/update-system-prompt", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(formObject),
					})
						.then((response) => response.json())
						.then((data) => {
							if (data.success) {
								alert("System prompt updated successfully");
								window.location.reload();
							} else {
								alert("System prompt update failed");
							}
						})
						.catch((error) => {
							alert("An error occurred. Please try again later.");
						});
				});
			});
	}

	if (classifierPrompt) {
		fetch("/get-classifier-prompt")
			.then((response) => response.json())
			.then((data) => {
				const form = document.createElement("form");
				form.className = "form";

				const classifierPromptLabel = document.createElement("label");
				classifierPromptLabel.textContent = "Classifier Prompt:";
				const classifierPromptInput = document.createElement("textarea");
				classifierPromptInput.name = "prompt";
				classifierPromptInput.rows = 20;
				classifierPromptInput.cols = 50;
				classifierPromptInput.required = true;
				classifierPromptInput.value = data.prompt;

				const updateBtn = document.createElement("input");
				updateBtn.type = "submit";
				updateBtn.value = "Update Classifier Prompt";
				updateBtn.className = "button";

				form.appendChild(classifierPromptLabel);
				form.appendChild(document.createElement("br"));
				form.appendChild(classifierPromptInput);
				form.appendChild(document.createElement("br"));
				form.appendChild(updateBtn);

				systemPrompts.appendChild(form);

				form.addEventListener("submit", (event) => {
					event.preventDefault();
					const formData = new FormData(form);
					const formObject = {};
					formData.forEach((value, key) => {
						formObject[key] = value;
					});

					fetch("/update-classifier-prompt", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(formObject),
					})
						.then((response) => response.json())
						.then((data) => {
							if (data.success) {
								alert("Classifier prompt updated successfully");
								window.location.reload();
							} else {
								alert("Classifier prompt update failed");
							}
						})
						.catch((error) => {
							alert("An error occurred. Please try again later.");
						});
				});
			});
	}

	if (reminderPrompt) {
		fetch("/get-reminder-prompt")
			.then((response) => response.json())
			.then((data) => {
				const form = document.createElement("form");
				form.className = "form";

				const reminderPromptLabel = document.createElement("label");
				reminderPromptLabel.textContent = "Reminder Prompt:";
				const reminderPromptInput = document.createElement("textarea");
				reminderPromptInput.name = "prompt";
				reminderPromptInput.rows = 20;
				reminderPromptInput.cols = 50;
				reminderPromptInput.required = true;
				reminderPromptInput.value = data.prompt;

				const updateBtn = document.createElement("input");
				updateBtn.type = "submit";
				updateBtn.value = "Update Reminder Prompt";
				updateBtn.className = "button";

				form.appendChild(reminderPromptLabel);
				form.appendChild(document.createElement("br"));
				form.appendChild(reminderPromptInput);
				form.appendChild(document.createElement("br"));
				form.appendChild(updateBtn);

				systemPrompts.appendChild(form);

				form.addEventListener("submit", (event) => {
					event.preventDefault();
					const formData = new FormData(form);
					const formObject = {};
					formData.forEach((value, key) => {
						formObject[key] = value;
					});

					fetch("/update-reminder-prompt", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(formObject),
					})
						.then((response) => response.json())
						.then((data) => {
							if (data.success) {
								alert("Reminder prompt updated successfully");
								window.location.reload();
							} else {
								alert("Reminder prompt update failed");
							}
						})
						.catch((error) => {
							alert("An error occurred. Please try again later.");
						});
				});
			});
	}
});
