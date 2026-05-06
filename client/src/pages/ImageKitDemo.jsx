import React from 'react';
import IKImage from '../components/common/IKImage';

const ImageKitDemo = () => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">ImageKit Integration Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Basic Image</h2>
          <IKImage 
            src="https://ik.imagekit.io/jain100/default-image.jpg" 
            width={400} 
            height={300} 
            className="rounded-md w-full"
          />
          <p className="mt-2 text-sm text-gray-500">Loaded using full URL</p>
        </div>

        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Transformed Image</h2>
          <IKImage 
            src="https://ik.imagekit.io/jain100/default-image.jpg"
            transformation={[{ height: 300, width: 400, blur: 10 }]}
            className="rounded-md w-full"
          />
          <p className="mt-2 text-sm text-gray-500">Blurred transformation applied</p>
        </div>
      </div>

      <div className="mt-8 p-6 bg-indigo-50 rounded-xl border border-indigo-100">
        <h3 className="text-indigo-900 font-bold mb-2">How to use this:</h3>
        <code className="block bg-gray-900 text-gray-100 p-4 rounded-md text-sm overflow-x-auto">
          {`import IKImage from '../components/common/IKImage';\n\n<IKImage \n  src="https://ik.imagekit.io/jain100/your-image.jpg"\n  width={400}\n  height={300}\n  transformation={[{ quality: 80 }]}\n/>`}
        </code>
      </div>
    </div>
  );
};

export default ImageKitDemo;
