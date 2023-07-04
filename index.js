const baseUrl = "https://branded-items-production.up.railway.app/api";

$(document).ready(function () {
  google.accounts.id.initialize({
    client_id:
      "518214596513-ms3k3036a4rlij0a7avoekcor4adsoog.apps.googleusercontent.com",
    callback: handleCredentialResponse,
  });
  google.accounts.id.renderButton(
    document.getElementById("buttonDiv"),
    { theme: "outline", size: "large" } // customization attributes
  );

  if (!localStorage.getItem("access_token")) {
    render("login");
  } else {
    fetchProducts();
    fetchCategories();
    render("dashboard");
  }

  $("#register-form").on("submit", function (event) {
    const username = $("#register-username").val();
    const email = $("#register-email").val();
    const password = $("#register-password").val();
    const phoneNumber = $("#register-phone").val();
    const address = $("#register-address").val();
    event.preventDefault();

    $.ajax(`${baseUrl}/register`, {
      method: "POST",
      data: {
        username,
        email,
        password,
        phoneNumber,
        address,
      },
    })
      .done(function (response) {
        Swal.fire("Good job!", `${response.message}`, "success");
        resetFormFields("register");
      })
      .fail(function (response) {
        Swal.fire("Error!", `${response.responseJSON.message}`, "error");
      });
  });

  $("#login-form").on("submit", function (event) {
    event.preventDefault();
    const email = $("#login-email").val();
    const password = $("#login-password").val();
    $.ajax(`${baseUrl}/login`, {
      method: "POST",
      data: {
        email,
        password,
      },
    })
      .done(function (response) {
        const token = response.data.access_token;
        const username = response.data.username;
        const role = response.data.role;
        localStorage.setItem("access_token", token);
        localStorage.setItem("username", username);
        localStorage.setItem("role", role);
        $("#username").text(username);
        Swal.fire(`${response.message}`, "success");
        fetchProducts();
        fetchCategories();
        render("dashboard");
        resetFormFields("login");
      })
      .fail(function (response) {
        Swal.fire("Error!", `${response.responseJSON.message}`, "error");
      });
  });

  $("#nav-dashboard").on("click", function (event) {
    event.preventDefault();
    render("dashboard");
  });

  $("#nav-product").on("click", function (event) {
    event.preventDefault();
    render("product");
  });

  $("#new-product").on("click", function (event) {
    event.preventDefault();
    render("new-product");
  });

  $("#product-form").on("click", "a", function (event) {
    event.preventDefault();
    render("product");
  });

  $("#product-form").on("submit", function (event) {
    event.preventDefault();
    postProduct();
    render("product");
  });

  $("#nav-category").on("click", function (event) {
    event.preventDefault();
    render("category");
  });

  $("#new-category").on("click", function (event) {
    event.preventDefault();
    render("new-category");
  });

  $("#category-form").on("submit", function (event) {
    event.preventDefault();
    postCategory();
    render("category");
  });

  $("#category-form").on("click", "a", function (event) {
    event.preventDefault();
    render("category");
  });

  $("#nav-logout").on("click", function (event) {
    event.preventDefault();
    logout();
  });
});

function postProduct() {
  const name = $("#product-name").val();
  const categoryId = $("#product-category").val();
  const description = $("#product-desc").val();
  const stock = $("#product-stock").val();
  const price = $("#product-price").val();
  const imgUrl = $("#product-image").val();
  $.ajax(`${baseUrl}/products`, {
    method: "POST",
    headers: {
      access_token: localStorage.getItem("access_token"),
    },
    data: {
      name,
      categoryId,
      description,
      stock,
      price,
      imgUrl,
    },
  })
    .done(function (response) {
      Swal.fire("Success!", `${response.message}`, "success");
      resetFormFields("postProduct");
      fetchProducts();
    })
    .fail(function (response) {
      Swal.fire("Error!", `${response.responseJSON.message}`, "error");
    });
}

function postCategory() {
  const name = $("#category-name").val();

  $.ajax(`${baseUrl}/categories`, {
    method: "POST",
    data: {
      name,
    },
  })
    .done(function (response) {
      Swal.fire("Success!", `${response.message}`, "success");
      resetFormFields("postCategory");
      fetchCategories();
    })
    .fail(function (response) {
      Swal.fire("Error!", `${response.responseJSON.message}`, "error");
    });
}

function fetchProducts() {
  $.ajax(`${baseUrl}/products`, {
    headers: {
      access_token: localStorage.getItem("access_token"),
    },
  })
    .done(function (response) {
      $("#total-product").text(response.count);
      const productsEl = response.data.map((product, i) => {
        return `
        <tr>
          <td scope="row">#${i + 1}</td>
          <td class="fw-bold">${product.name}</td>
          <td>
            <img src=${product.imgUrl} class="img-fluid" />
          </td>
          <td class="truncate">${product.description}</td>
          <td>13</td>
          <td class="fw-bold">${product.price}</td>
          <td class="fw-bold">${product.User.username}</td>
          ${
            (localStorage.getItem("role") === "Staff" &&
              localStorage.getItem("username") === product.User.username) ||
            localStorage.getItem("role") === "Admin"
              ? `<td>
                  <a href="" onclick="deleteProduct(event, ${product.id})" class="ms-3"><span class="icon material-symbols-outlined text-danger">delete</span></a>
                </td>`
              : ""
          }
        </tr>
      `;
      });
      $("#table-product").html(productsEl);
    })
    .fail(function (response) {
      Swal.fire("Error!", `${response.responseJSON.message}`, "error");
    });
}

function fetchCategories() {
  $.ajax(`${baseUrl}/categories`)
    .done(function (response) {
      $("#total-category").text(response.count);
      const categoriesEl = response.data.map((category, i) => {
        return `
        <tr>
          <td scope="row">#${i + 1}</td>
          <td class="fw-bold">${category.name}</td>
          <td>
            <a href="" onclick="deleteCategory(event, ${
              category.id
            })" class="ms-3"><span class="icon material-symbols-outlined text-danger">delete</span></a>
          </td>
        </tr>
      `;
      });
      $("#table-category").html(categoriesEl);

      const categoriesOp = response.data.map((category, i) => {
        return `
        <option value="${category.id}">${category.name}</option>
      `;
      });
      $("#product-category").html(
        `<option value="" selected disabled>-- Select Category --</option>` +
          categoriesOp
      );
    })
    .fail(function (response) {
      Swal.fire("Error!", `${response.responseJSON.message}`, "error");
    });
}

function deleteProduct(event, id) {
  event.preventDefault();
  Swal.fire({
    title: "Are you sure?",
    text: "You want to delete this product!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, confirm!",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax(`${baseUrl}/products/${id}`, {
        method: "DELETE",
        headers: {
          access_token: localStorage.getItem("access_token"),
        },
      })
        .done(function (response) {
          Swal.fire(`${response.message}`, "success");
          fetchProducts();
          render("product");
        })
        .fail(function (response) {
          Swal.fire("Error!", `${response.responseJSON.message}`, "error");
        });
    }
  });
}

function deleteCategory(event, id) {
  event.preventDefault();
  Swal.fire({
    title: "Are you sure?",
    text: "You want to delete this category!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, confirm!",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax(`${baseUrl}/categories/${id}`, {
        method: "DELETE",
      })
        .done(function (response) {
          Swal.fire(`${response.message}`, "success");
          fetchCategories();
          render("category");
        })
        .fail(function (response) {
          Swal.fire("Error!", `${response.responseJSON.message}`, "error");
        });
    }
  });
}

function logout() {
  Swal.fire({
    title: "Are you sure?",
    text: "You need to relogin!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, confirm!",
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem("username");
      localStorage.removeItem("role");
      localStorage.removeItem("access_token");
      Swal.fire("Logout!", "Your already logout.", "success");
      render("login");
    }
  });
}

function handleCredentialResponse(response) {
  $.ajax(`${baseUrl}/login-google`, {
    method: "POST",
    data: {
      token: response.credential,
    },
  })
    .done(function (response) {
      const token = response.data.access_token;
      const { username, role } = response.data;

      localStorage.setItem("access_token", token);
      localStorage.setItem("username", username);
      localStorage.setItem("role", role);
      Swal.fire(`${response.message}`, "success");
      $("#username").text(username);
      fetchProducts();
      fetchCategories();
      render("dashboard");
      resetFormFields("login");
      render("dashboard");
    })
    .fail(function (response) {
      Swal.fire("Error!", `${response.responseJSON.message}`, "error");
    });
}

function resetFormFields(params) {
  switch (params) {
    case "register":
      $("#register-username").val("");
      $("#register-email").val("");
      $("#register-password").val("");
      $("#register-phone").val("");
      $("#register-address").val("");
      break;

    case "login":
      $("#login-email").val("");
      $("#login-password").val("");
      break;

    case "postProduct":
      $("#product-name").val("");
      $("#product-category").val("");
      $("#product-desc").val("");
      $("#product-stock").val("");
      $("#product-price").val("");
      $("#product-image").val("");
      break;

    case "postCategory":
      $("#category-name").val("");
      break;
  }
}

function render(params) {
  $("#login-section").hide();
  $("#home-section").hide();
  $("#dashboard-section").hide();
  $("#product-section").hide();
  $("#new-product-section").hide();
  $("#category-section").hide();
  $("#new-category-section").hide();

  switch (params) {
    case "login":
      $("#login-section").show();
      break;

    case "dashboard":
      $("#home-section").show();
      $("#dashboard-section").show();
      break;

    case "product":
      $("#home-section").show();
      $("#product-section").show();
      break;

    case "new-product":
      $("#home-section").show();
      $("#new-product-section").show();
      break;

    case "category":
      $("#home-section").show();
      $("#category-section").show();
      break;

    case "new-category":
      $("#home-section").show();
      $("#new-category-section").show();
      break;
  }
}
