import React, { useState,useEffect } from 'react';
import axios from 'axios';
import './Register.css';




const Cart = ({ cart, setCart, formData, setView, username, handleAddToCart  }) => {
  const [userInput1, setUserInput1] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState("razorpay"); // Default payment method
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showCart, setShowCart] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressDetails, setAddressDetails] = useState({
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });
  const [addressList, setAddressList] = useState([]);
  const [editIndex, setEditIndex] = useState(null); // State to track the index of the address being edited
  const [orderDetails, setOrderDetails] = useState(null)
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const[visible,setinvisible]=useState(false)




  const [productQuantity, setProductQuantity] = useState(1);

  const products = [
    { name: 'Product 1', image: 'image1.jfif', price: 10 },
    { name: 'Product 2', image: 'image2.jpg', price: 20 },
    { name: 'Product 3', image: 'image3.png', price: 15 },
    { name: 'Product 4', image: 'image4.png', price: 25 },
    { name: 'Product 5', image: 'image5.png', price: 30 },
  ];

  




  useEffect(() => {
    // Fetch existing addresses from the backend
    const fetchAddresses = async () => {
      try {

        const response = await axios.get(`https://online-saleserver1.onrender.com/api/get-addresses/${formData.username}`);
       

        setAddressList(response.data);
      } catch (error) {
        console.error('Error fetching addresses:', error);
      }
    };

    fetchAddresses();
  }, [formData.username]); // Fetch addresses when the username changes













  

  const handleRemove = async (index) => {
    const productId = cart[index]._id; // Get product ID
    const username = formData.username; // Get username

    // Remove product from local state
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);

    // Send DELETE request to backend to remove the product from the cart
    try {

      await axios.delete(`https://online-saleserver1.onrender.com/api/remove-from-cart/${username}/${productId}`, {

        data: { productId } // Send product ID to the server
      });
      alert('Product removed from cart!');
    } catch (error) {
      console.error('Error removing product:', error);
      alert('Failed to remove product from cart.');
    }
  };



  const handleCancel = async (index) => {
    const orderId = orders[index]._id; // Ensure you're using _id
    const username = formData.username;
  
    if (!orderId) {
      alert('Invalid order ID.');
      return;
    }
  
    // Optional: Confirm the cancellation action
    const confirmCancel = window.confirm('Are you sure you want to cancel this order?');
    if (!confirmCancel) return;
  
    try {

      await axios.delete(`https://online-saleserver1.onrender.com/api/delete-orders/${username}/${orderId}`);

      const updatedOrders = orders.filter((_, i) => i !== index);
      setOrders(updatedOrders);
      alert('Order canceled successfully!');
    } catch (error) {
      console.error('Error canceling the order:', error);
      if (error.response) {
        // Server responded with a status other than 2xx
        alert(`Error: ${error.response.data.message}`);
      } else if (error.request) {
        // Request was made but no response received
        alert('No response from server. Please try again later.');
      } else {
        // Something else caused the error
        alert('An unexpected error occurred.');
      }
    }
  };
  





  const handleBuyNow = () => {
    setShowAddressForm(true);
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressDetails({ ...addressDetails, [name]: value });
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editIndex !== null) {
        // Update existing address
        const updatedAddressList = addressList.map((address, index) =>
          index === editIndex ? addressDetails : address
        );
        setAddressList(updatedAddressList);
        setEditIndex(null); // Reset edit index

        // Send PUT request to update the address in the backend

        await axios.put(`https://online-saleserver1.onrender.com/api/update-address/${formData.username}`, addressDetails);

      } else {
        // Add new address
        const newAddress = { ...addressDetails };
        setAddressList([...addressList, newAddress]);

        // Send POST request to add a new address to the backend

        await axios.post(`https://online-saleserver1.onrender.com/api/add-address/${formData.username}`, newAddress);

      }

      // Clear the address form
      setAddressDetails({
        address: '',
        city: '',
        state: '',
        zip: '',
        country: '',
      });
      setShowAddressForm(false);
    } catch (error) {
      console.error('Error submitting address:', error);
    }
  };

  const handleEdit = (index) => {
    // Set the address details for editing
    setAddressDetails(addressList[index]);
    setEditIndex(index); // Set the index of the address being edited
    setShowAddressForm(true); // Show the form to edit
  };

  const handleDelete = async (index) => {
    // Remove the address from the list
    const updatedAddressList = addressList.filter((_, i) => i !== index);
    setAddressList(updatedAddressList);

    // Send DELETE request to remove the address from the backend
    try {

      await axios.delete(`https://online-saleserver1.onrender.com/api/delete-address/${formData.username}/${index}`);

     
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };


  const handlebuynow1 = async () => {
    const contact = userInput1; // Assuming userInput1 is a state variable for the user's phone number
    
    if (paymentMethod === "razorpay") {
      if (!window.Razorpay) {  // Check if Razorpay is not loaded
        console.error("Razorpay not loaded");
        return;
      }
  
      // Collect all order details
      const total = cart.reduce((acc, product) => acc + product.price * product.quantity, 0);
      const orderInfo = cart.map(product => ({
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: product.quantity,
      }));
  
      const order = { items: orderInfo, total };
  
      // Razorpay options
      const options = {
        key: "rzp_live_RMH0AI4MrQgG5Y",
        amount: total * 100, // Razorpay amount is in paise
        currency: "INR",
        name: "Projecthan",
        description: "Test Transaction",
        handler: async function (response) {
          // Send order data to backend after successful payment
          try {

            const response = await axios.post(`https://online-saleserver1.onrender.com/api/orders`, {

     
              username: formData.username, // Ensure formData.username is defined
              order: order,
              razorpay_payment_id: response.razorpay_payment_id // Include payment ID if needed
            });
  
            console.log('Order saved successfully', response.data);
            alert('Order placed successfully!');
            
            // Update local state
            setOrderDetails(order);
            setShowOrderDetails(false);
            setShowAddressForm(false);
            // Navigate after order is placed
          } catch (error) {
            console.error('Error saving order', error);
            alert('Failed to place order. Please try again.');
          }
        },
        prefill: {
          name: "joseph", // Consider making this dynamic
          email: "immanuel238@gmail.com", // Consider making this dynamic
          contact: contact, // Use the contact variable defined earlier
        },
        theme: {
          color: "#3399cc",
        },
      };
  
      const rzp = new window.Razorpay(options);
      rzp.open();
  
    } else if (paymentMethod === "cod") {
      const userInput = window.prompt('Please enter your phone number');
  
      if (userInput) {
        alert("Cash on Delivery selected.");
  
        // Send a message for Cash on Delivery
        const messageResponse = await sendMessage(userInput, "Cash on Delivery");
        if (messageResponse) {
          alert("Message sent successfully.");
        }
  
        // Collect all order details for COD
        const total = cart.reduce((acc, product) => acc + product.price * product.quantity, 0);
        const orderInfo = cart.map(product => ({
          name: product.name,
          image: product.image,
          price: product.price,
          quantity: product.quantity,
        }));
  
        const order = { items: orderInfo, total };
  
        // Send order data to backend for COD
        try {

          const response = await axios.post(`https://online-saleserver1.onrender.com/api/orders`, {

        
            username: formData.username, // Ensure this is defined
            order: order,
            payment_method: "cod" // Include payment method
          });
  
          console.log('Order saved successfully', response.data);
          alert("Order placed successfully! Payment will be collected upon delivery.");
          setOrderDetails(order);
          setShowOrderDetails(false);
          setShowAddressForm(false);
          // Navigate after order is placed
        } catch (error) {
          console.error('Error saving order', error);
          alert('Failed to place order. Please try again.');
        }
      } else {
        alert("Phone number is required for Cash on Delivery. Order not placed.");
      }
    } else {
      alert("Please select a payment method.");
    }
  };
  





  const sendMessage = async (userInput, method) => {
    setLoading(true);
    try {
      // Use your server endpoint for sending messages

      const response = await axios.post(`https://online-saleserver1.onrender.com/send-message`, {

    
        messageBody: `${method}: ${userInput}`, // Dynamic message body based on the payment method
        toNumber: '+916369828419', // Your number
      });
      return response.data; // Show success message
    } catch (err) {
      console.error(err);
      setError('Failed to send message.');
      return null; // Return null on error
    } finally {
      setLoading(false);
    }
  }



















  
const handleorder = async () => {
  if (formData.username) { // Ensure username is available
    try {
      // Fetch orders from backend

      const response = await axios.get(`https://online-saleserver1.onrender.com/api/orders`, {

        params: { username: formData.username }, // Send username as query param
      });

      setOrders(response.data.orders); // Assuming the response contains an 'orders' array
      setShowOrderDetails(true);
      setShowCart(false); // Hide cart
      setShowAddressForm(false); // Hide address form

      console.log('Orders fetched successfully:', response.data.orders);
    } catch (error) {
      console.error('Error fetching orders', error);
      alert('Failed to fetch orders. Please try again.');
    }
  } else {
    alert('Username is required to fetch orders.');
  }
};

  const handleadress=()=>{
    setShowAddressForm(true);
  }

const handlegotocartpage=()=>{
  setShowCart(true);
  setShowAddressForm(true); // Show the address form as well setShowCart(true);
 
}
  const handleGoToViewCart = () => {
    setinvisible(true)
  };
  return (
    <div className="cart-container">
      <h2 className="cart-title">Cart</h2>
  
    
           {showCart && (
        <>
          {cart.length === 0 ? (
            <p className="empty-cart">Your cart is empty.</p>
          ) : (
            cart.map((product, index) => (
              <div key={index} className="cart-item">
                {product.image1 && product.image1.jfif ? (
                  <img src={product.image1.jfif} alt={product.name} className="cart-item-image" />
                ) : (
                  <img src="/image1.jfif" alt="Default" className="cart-item-image" /> // Fallback image
                )}
                <h3 className="cart-item-name">{product.name}</h3>
                <p className="cart-item-price">Price: ${product.price.toFixed(2)}</p>
                <p className="cart-item-quantity">Quantity: {product.quantity}</p>
                <button className="remove-button" onClick={() => handleRemove(index)}>Remove</button>
              </div>
           
            ))
          )}
          <div class="button-container">
          {cart.length > 0 && (
            <button className="buy-now-button" onClick={handlebuynow1}>Buy Now</button>
          )}
          <div className="payment-methods">
            <label>
              <input
                type="radio"
                value="razorpay"
                checked={paymentMethod === "razorpay"}
                onChange={() => setPaymentMethod("razorpay")}
              />
              Razorpay
            </label>
            <label style={{ marginLeft: '20px' }}>
              <input
                type="radio"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
              />
              Cash on Delivery
            </label>
          </div>
          <button className="order-button" onClick={handleorder}>Order</button>
          <button className="address-button" onClick={handleadress}>Address</button>
       

          </div>
        </>
      
      )}
       

      
  {showOrderDetails && (
  <div className="order-details">
    <h2>Your Orders</h2>
    {loadingOrders ? (
      <p>Loading orders...</p>
    ) : ordersError ? (
      <p style={{ color: 'red' }}>{ordersError}</p>
    ) : orders.length === 0 ? (
      <p>No orders found.</p>
    ) : (
      orders.map((order, index) => (
        <div key={index} className="order-item">
          <h3>Order #{index + 1}</h3>
          <p>Total: ${order.total}</p>
          <p>Date: {new Date(order.date).toLocaleDateString()}</p>
          <h4>Items:</h4>
          {order.items.map((item, idx) => (
            <div key={idx} className="order-item-details">
              <img
                src={item.image || '/image1.jfif'} // Fallback image if item.image is not available
                alt={item.name}
                className="order-item-image"
                onError={(e) => {
                  e.target.onerror = null; // Prevent infinite loop
                  e.target.src = '/image1.jfif';
                }}
              />
              <div className="order-item-info">
                <p>{item.name}</p>
                <p>Price: ${item.price}</p>
                <p>Quantity: {item.quantity}</p>
              </div>
            </div>
          ))}
          <button className="cancel-button" onClick={() => handleCancel(index)}>Cancel</button>
        </div>
      ))
    )}
    <div>
      <button className="remove-button" onClick={handlegotocartpage}>Go to CartPage</button>
         
      <button className="remove-button" onClick={handleGoToViewCart}>
        Go to viewCart
      </button>
    </div>
   
        </div>
      )}
  
      {showAddressForm && (
        <form className="address-form" onSubmit={handleAddressSubmit}>
          <h3>{editIndex !== null ? "Edit Your Address" : "Enter Your Address"}</h3>
          <input type="text" name="address" placeholder="Address" value={addressDetails.address} onChange={handleAddressChange} required />
          <input type="text" name="city" placeholder="City" value={addressDetails.city} onChange={handleAddressChange} required />
          <input type="text" name="state" placeholder="State" value={addressDetails.state} onChange={handleAddressChange} required />
          <input type="text" name="zip" placeholder="Zip Code" value={addressDetails.zip} onChange={handleAddressChange} required />
          <input type="text" name="country" placeholder="Country" value={addressDetails.country} onChange={handleAddressChange} required />
          <button type="submit"className="remove-button">{editIndex !== null ? "Update Address" : "Submit Address"}</button>
        </form>
      )}
  
      {addressList.length > 0 && showAddressForm && (
        <div className="submitted-addresses">
          <h3>Submitted Addresses</h3>
          <table>
            <thead>
              <tr>
                <th>Address</th>
                <th>City</th>
                <th>State</th>
                <th>Zip Code</th>
                <th>Country</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {addressList.map((address, index) => (
                <tr key={index}>
                  <td>{address.address}</td>
                  <td>{address.city}</td>
                  <td>{address.state}</td>
                  <td>{address.zip}</td>
                  <td>{address.country}</td>
                  <td>
                    <button className="remove-button" onClick={() => handleEdit(index)}>Edit</button>
                    <button  className="remove-button"onClick={() => handleDelete(index)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
  
};




function App() {
 
  const [cart, setCart] = useState([]);
  const [view, setView] = useState('login'); // 'login', 'register', 'cart', 'products', 'forgotPassword', 'orderSummary'
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    username: '',
    password: '',
  });
  const [message, setMessage] = useState('');
 const [productQuantity, setProductQuantity] = useState(1);
 
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Register
  const handleRegister = async (e) => {
    e.preventDefault();
    try {

      const res = await axios.post(`https://online-saleserver1.onrender.com/api/register`, formData);

      setMessage(res.data.message);
      setView('login');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registration failed');
    }
  };

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {

      const res = await axios.post(`https://online-saleserver1.onrender.com/api/login`, {

        username: formData.username,
        password: formData.password,
      });
      setMessage(res.data.message);
      setCart(res.data.cart);
      setView('products'); // Redirect to products
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed');
    }
  };

  // Function to add product to cart and database
  const handleAddToCart = async (product) => {
    // Add product to cart state
    setCart((prevCart) => [...prevCart, product]);

    // Send product to backend
    try {

      await axios.post(`https://online-saleserver1.onrender.com/api/add-to-cart`, {

      
        username: formData.username, // Assuming you have the logged-in username in formData
        product: {
          name: product.name,
          image: product.image,
          price: product.price,
          quantity: product.quantity,
        },
      });
      alert('Product added to cart and saved to database!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add product to cart.');
    }
  };


 

  return (
    <div className="App">
  {view === 'login' && (
    <div className="login-container">
      <h2 className="login-title">Login</h2>
      <form className="login-form" onSubmit={handleLogin}>
        <input
          type="text"
          name="username"
          className="input-field"
          placeholder="Username"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          className="input-field"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <button type="submit" className="submit-button">Login</button>
      </form>
      <button onClick={() => setView('register')} className="register-button">Register</button>
      {message && <p className="message">{message}</p>}
    </div>
  )}


{view === 'register' && (
  <div>
    <h3>Register</h3>
    <form onSubmit={handleRegister} className="register-form"> {/* Apply class here */}
      <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
      <input type="text" name="phone" placeholder="Phone" onChange={handleChange} required />
      <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
      <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
      <button type="submit">Register</button>
    </form>
    {message && <p>{message}</p>}
  </div>
)}

{view === 'cart' && (
  <Cart cart={cart} setCart={setCart} formData={formData} setView={setView} />
)}

{view === 'products' && (
  <div>
    <h2>Products</h2>
    {[
      { name: 'Product 1', image: 'image1.jfif', price: 10 },
      { name: 'Product 2', image: 'image2.jpg', price: 20 },
      { name: 'Product 3', image: 'image3.png', price: 15 },
      { name: 'Product 4', image: 'image4.png', price: 25 },
      { name: 'Product 5', image: 'image5.png', price: 30 }
    ].map((product, index) => (
      <div className="product-item" key={index}>
        <img src={product.image} alt={product.name} width="150" height="200" />
        <h2>{product.name}</h2>
        <p>Price: ${product.price}.00</p>
        <div className="quantity-controls">
          <button
            className="quantity-button"
            onClick={() => setProductQuantity(prev => Math.max(1, prev - 1))}
          >
            -
          </button>
          <span>{productQuantity}</span>
          <button
            className="quantity-button"
            onClick={() => setProductQuantity(prev => prev + 1)}
          >
            +
          </button>
        </div>
        <button
          className="add-to-cart-button"
          onClick={() => handleAddToCart({ name: product.name, image: product.image, price: product.price, quantity: productQuantity })}
        >
          Add to Cart
        </button>
      </div>
    ))}
    <button className="add-to-cart-button" onClick={() => setView('cart')}>
      View Cart
    </button>
  </div>
)}


    </div>
  );
}

export default App;
