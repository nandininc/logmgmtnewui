import React, { useState } from 'react';

const CreateProduct = ({ onCreate }) => {
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simple validation
    if (!product.name || !product.description || !product.price || !product.category) {
      setError('Please fill in all required fields.');
      return;
    }

    // You can replace this with a POST request
    console.log('Product submitted:', product);

    if (onCreate) onCreate(product);

    setSuccess('Product created successfully!');
    setProduct({
      name: '',
      description: '',
      price: '',
      category: '',
      imageUrl: ''
    });
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-2xl font-bold mb-4 text-center">Create Product</h2>

      {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-2 mb-4 rounded">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block font-medium text-gray-700 mb-1">Product Name *</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
            placeholder="Enter product name"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
            placeholder="Enter product description"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-700 mb-1">Price *</label>
          <input
            type="number"
            name="price"
            value={product.price}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
            placeholder="Enter price"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-700 mb-1">Category *</label>
          <input
            type="text"
            name="category"
            value={product.category}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
            placeholder="Enter category"
          />
        </div>

        <div className="mb-6">
          <label className="block font-medium text-gray-700 mb-1">Image URL (optional)</label>
          <input
            type="text"
            name="imageUrl"
            value={product.imageUrl}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Create Product
        </button>
      </form>
    </div>
  );
};

export default CreateProduct;
