function addToCart(proId) {
    $.ajax({
        url: '/add-to-cart/' + proId,
        method: 'get',
        success: (response) => {
            if (response.status) {
                let count = $('#cart-count').html()
                count = parseInt(count) + 1
                $("#cart-count").html(count)
            }
        }
    })
}
function changeQuantity(cartId, proId, userId, count) {
    let quantity = parseInt(document.getElementById(proId).innerHTML)
    count = parseInt(count)
    $.ajax({
        url: '/change-product-quantity',
        data: {
            user: userId,
            cart: cartId,
            product: proId,
            count: count,
            quantity: quantity
        },
        method: 'post',
        success: (response) => {
            if (response.removeProduct) {
                alert("Product removed from cart")
                location.reload()
            } else {
                document.getElementById(proId).innerHTML = quantity + count
                document.getElementById('total-value').innerHTML = response.total
            }
        }

    })
}
function removeFromCart(cartId, proId) {
    $.ajax({
        url: '/cart-remove',
        data: {
            cart: cartId,
            product: proId,
        },
        method: 'post',
        success: (response) => {
            alert("Product removed from cart")
            location.reload()
        }

    })
}
$("#checkout-form").submit((e) => {
    e.preventDefault()
    $.ajax({
        url: '/place-order',
        method: 'post',
        data: $('#checkout-form').serialize(),
        success: (response) => {
            //alert(response)
            if (response.codSuccess) {
                //location.href='/order-success'
                var modalObj = document.getElementById("modal-popup")
                var pageObj = document.getElementById("delivery-details-body")
                modalObj.style.display = 'block'
                pageObj.style.animation = 'fade 250ms'
                pageObj.style.animationFillMode = 'forwards'
                pageObj.style.animationTimingFunction = 'ease-in-out'
            } else {
                razorpayPayment(response)
            }
        }
    })
})
function razorpayPayment(order) {
    var options = {
        "key": "rzp_test_tZNQqeAcj44cu3", // Enter the Key ID generated from the Dashboard
        "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "Adithya S Nair",
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
        "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response) {
            // alert(response.razorpay_payment_id);
            // alert(response.razorpay_order_id);
            // alert(response.razorpay_signature)
            verifyPayment(response, order)
        },
        "prefill": {
            "name": "Adithya S Nair",
            "email": "adithyasnair00@gmail.com",
            "contact": "7356658947"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();
}
function verifyPayment(payment, order) {
    $.ajax({
        url: '/verify-payment',
        data: {
            payment,
            order
        },
        method: 'post',
        success: (response) => {
            if (response.status) {
                var modalObj = document.getElementById("modal-popup")
                var pageObj = document.getElementById("delivery-details-body")
                modalObj.style.display = 'block'
                pageObj.style.animation = 'fade 250ms'
                pageObj.style.animationFillMode = 'forwards'
                pageObj.style.animationTimingFunction = 'ease-in-out'
            }
        }
    })
}