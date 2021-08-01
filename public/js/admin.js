console.log("testing");

const deleteProduct = (buttonElement) => {
  const prodId = buttonElement.parentNode.querySelector(
    "input[name=productId]"
  ).value;
  const csrfToken =
    buttonElement.parentNode.querySelector("input[name=_csrf]").value;

  console.log("try-delete");

  // the product
  const productElement = buttonElement.closest("article");

  console.log(prodId, csrfToken);
  fetch("/admin/products/" + prodId, {
    method: "DELETE",
    headers: {
      "csrf-token": csrfToken,
    },
  })
    .then((result) => {
      return result.json();
    })
    .then((data) => {
      console.log(data);
      productElement.parentNode.removeChild(productElement);
    })
    .catch((err) => {
      console.log(err);
    });
};
