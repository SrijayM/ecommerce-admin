import axios from "axios";
import { redirect } from "next/dist/server/api-utils";
import { Router, useRouter } from "next/router";
import { useEffect, useState } from "react";
import Spinner from "./spinner";
import { ReactSortable } from "react-sortablejs";


export default function ProductForm({_id,title:existingTitle,description:existingdescription,price:existingprice,images:existingImages,category:assignedCategory,  properties:assignedProperties}){
    const[title,setTitle] = useState(existingTitle||'');
    const [images,setImages]= useState(existingImages||[]);
    const [category,setCategory] = useState(assignedCategory||  '');
    const[description,setDescription] = useState(existingdescription||'');
    const[price,setPrice] = useState(existingprice||'');
    const[goBack, setGoBack] = useState(false);
    const [productProperties,setProductProperties] = useState(assignedProperties || {});
    const [isUploading,setIsUploading] = useState(false);
    const [categories,setCategories] = useState([]);
    const router = useRouter();
    useEffect(() => {
      axios.get('/api/categories').then(result => {
        setCategories(result.data);
      })
    }, []);

    async function saveProduct(ev){
      ev.preventDefault();
      const data = {title,description,price,images,category,properties:productProperties};
      if(_id){
        await axios.put('/api/products', {...data,_id});
      }
      else{
        await axios.post('/api/products',data);
      }
      setGoBack(true);
    }

    if(goBack){
      router.push('/products')
    }

    async function uploadImage(ev){
        const files = ev.target?.files;
        if (files?.length>0){
            setIsUploading(true);
            const data = new FormData();
            for (const file of files){
                data.append('file', file)
            }
            const res = await axios.post('/api/upload',data,);
            setImages(oldImages => {
                return [...oldImages, ...res.data.links];
            });
            setIsUploading(false);
        }
    } 

    function updateImagesOrder(images){
        setImages(images);
    }

    function setProductProp(propName,value) {
      setProductProperties(prev => {
        const newProductProps = {...prev};
        newProductProps[propName] = value;
        return newProductProps;
      });
    }

    const propertiesToFill = [];
    if (categories.length > 0 && category) {
      let catInfo = categories.find(({_id}) => _id === category);
      propertiesToFill.push(...catInfo.properties);
      while(catInfo?.parent?._id) {
        const parentCat = categories.find(({_id}) => _id === catInfo?.parent?._id);
        propertiesToFill.push(...parentCat.properties);
        catInfo = parentCat;
      }
    }

    return(
        <form onSubmit={saveProduct}>
        
          <label>Product Name</label>
          <input type='text' 
                placeholder="product name" 
                value={title} 
                onChange={ev=> setTitle(ev.target.value)}
          />
          <label>Category</label>
          <select value={category}  onChange={ev => setCategory(ev.target.value)}>
            <option value=''>Uncategorized</option>
            {categories.length > 0 && categories.map(categorys => (
            <option key={categorys._id} value={categorys._id}>{categorys.name}</option>
          ))}
          </select>
          {propertiesToFill.length>0 && propertiesToFill.map(p=>(
            <div>
              <label>{p.name[0].toUpperCase()+p.name.substring(1)}</label>
              <div>
                <select value={productProperties[p.name]} onChange={ev=> setProductProp(p.name,ev.target.value)}>
                  {p.values.map(v=>(
                    <option value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
          <label>
            Photos 
          </label>
          <div className="flex flex-wrap gap-1">
            <ReactSortable list={images} setList={updateImagesOrder} className="flex flex-wrap gap-1">
            {!!images?.length && images.map(link =>(
                <div key={link} className="h-24 hover:cursor-pointer hover:opacity-70 bg-white p-2 shadow-sm rounded-sm border border-gray-200">
                    <img src={link} alt="" className="rounded-lg"/>
                </div>
            ))}
            </ReactSortable>
            {isUploading && (
                <div className="h-24 p-1 flex items-center">
                    <Spinner/>
                </div>
            )}
            <label className="cursor-pointer w-24 h-24 text-center flex items-center text-sm gap-1 rounded-sm bg-white shadow-sm border hover:bg-gray-100 transition-shadow border-primary text-primary justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15" />
                </svg>
                <div>
                    Upload
                </div>
                <input type="file" onChange={uploadImage} className="hidden"/>
            </label>
          </div>
          <label>Description</label>
          <textarea placeholder="description" 
                    value={description}
                    onChange={ev => setDescription(ev.target.value)}
          />
          <label>Price (USD)</label>
          <input type='number' 
          placeholder="price"
          value={price}
          onChange={ev => setPrice(ev.target.value)}
          />
  
          <button type='submit' className="btn-primary">Save</button>
        </form>
    )
}