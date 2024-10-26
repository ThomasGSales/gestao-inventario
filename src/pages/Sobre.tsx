import kermitImage from '../assets/kermit.jpg'

const Sobre = () => {
  return (
    <div className="p-6">
      <h1>Sobre</h1>
      <p>Projeto feito na aula de programacao web</p>
      <img src={kermitImage} alt="Kermit" width={512}></img>
    </div>
  );
};

export default Sobre;