import kermitImage from '../assets/kermit.jpg';

const Sobre = () => {
  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-4">Sobre</h1>
      <p className="mb-4">Projeto feito na aula de programação web</p>
      <img src={kermitImage} alt="Kermit" width={512} className="mt-4" />
    </div>
  );
};

export default Sobre;