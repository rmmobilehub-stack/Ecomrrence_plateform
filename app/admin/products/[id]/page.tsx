import ProductForm from '@/components/admin/ProductForm';
export default function EditProductPage({params}:{params:{id:string}}){return <><div className="page-header"><div><h1 className="page-title">Edit product</h1><p className="page-subtitle">Update pricing, stock, photos and options.</p></div></div><ProductForm id={params.id}/></>}
