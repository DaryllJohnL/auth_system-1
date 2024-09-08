import React, { useState } from 'react';
import { Card, ListGroup, Button, Row, Col } from 'react-bootstrap';
import { FaBolt, FaWater, FaTv, FaPhone, FaCreditCard, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import PaymentModal from './PaymentModal';  // Import the modal component
import meralcoBg from '../assets/images/MERALCO.jpg';
import alecoBg from '../assets/images/ALECO.jpg';
import anecoBg from '../assets/images/ANECO.png';
import mayniladBg from '../assets/images/MAYNILAD.jpg';
import angelesBg from '../assets/images/ANGELES.png';
import aquaBg from '../assets/images/AQUA.jpg';
import globeBg from '../assets/images/GLOBE.png';
import pldtBg from '../assets/images/PLDT.jpg';
import convergeBg from '../assets/images/CONVERGE.jpg';
import visaBg from '../assets/images/VISA.png';
import mastercardBg from '../assets/images/MASTERCARD.jpg';

const BillCategoriesCard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [electricOpen, setElectricOpen] = useState(false);
  const [waterOpen, setWaterOpen] = useState(false);
  const [cableOpen, setCableOpen] = useState(false);
  const [telecomOpen, setTelecomOpen] = useState(false);
  const [creditCardOpen, setCreditCardOpen] = useState(false);

  const [showModal, setShowModal] = useState(false); // Control modal visibility
  const [selectedCategory, setSelectedCategory] = useState(null); // Store selected category

  const toggleCollapse = () => setIsOpen(!isOpen);

  const handleSubcategoryClick = (category) => {
    setSelectedCategory(category);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const renderSubcategories = (items) => (
    <Row>
      {items.map((item, index) => (
        <Col key={index} xs={12} md={4} className="text-center my-2">
          <div
            className="subcategory-item"
            style={{
              backgroundImage: `url(${item.background})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              padding: '10px',
              borderRadius: '8px',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '120px',
              border: '1px solid #ddd',
              cursor: 'pointer',
              position: 'relative'  // Add this for absolute positioning
            }}
            onClick={() => handleSubcategoryClick(item)}  // Handle click
          >
            {/* Hidden Name Text */}
            <span style={{ visibility: 'hidden' }}>{item.name}</span>
          </div>
        </Col>
      ))}
    </Row>
  );
  

  return (
    <>
      <Card className='mb-4 h-100'>
        <Card.Header as='h5' className='d-flex justify-content-between align-items-center'>
          Pay Bills
          <Button
            variant='link'
            className='d-flex align-items-center'
            onClick={toggleCollapse}
          >
            {isOpen ? <FaChevronUp /> : <FaChevronDown />}
          </Button>
        </Card.Header>
        <Card.Body>
          <div className={`collapse ${isOpen ? 'show' : ''}`}>
            <ListGroup variant='flush'>
              {/* Electric Utilities */}
              <ListGroup.Item className='d-flex justify-content-between align-items-center' onClick={() => setElectricOpen(!electricOpen)}>
                <div><FaBolt className='me-2' /> Electric Utilities</div>
                <Button variant='link' className='p-0'>
                  {electricOpen ? <FaChevronUp /> : <FaChevronDown />}
                </Button>
              </ListGroup.Item>
              <div className={`collapse ${electricOpen ? 'show' : ''}`}>
                {renderSubcategories([
                  { name: 'Meralco', background: meralcoBg },
                  { name: 'ANECO', background: anecoBg },
                  { name: 'ALECO', background: alecoBg }
                ])}
              </div>

              {/* Water Utilities */}
              <ListGroup.Item className='d-flex justify-content-between align-items-center' onClick={() => setWaterOpen(!waterOpen)}>
                <div><FaWater className='me-2' /> Water Utilities</div>
                <Button variant='link' className='p-0'>
                  {waterOpen ? <FaChevronUp /> : <FaChevronDown />}
                </Button>
              </ListGroup.Item>
              <div className={`collapse ${waterOpen ? 'show' : ''}`}>
                {renderSubcategories([
                  { name: 'Maynilad', background: mayniladBg },
                  { name: 'Angeles Water', background: angelesBg },
                  { name: 'Aqua Centro', background: aquaBg }
                ])}
              </div>

              {/* Cable/Internet */}
              <ListGroup.Item className='d-flex justify-content-between align-items-center' onClick={() => setCableOpen(!cableOpen)}>
                <div><FaTv className='me-2' /> Cable/Internet</div>
                <Button variant='link' className='p-0'>
                  {cableOpen ? <FaChevronUp /> : <FaChevronDown />}
                </Button>
              </ListGroup.Item>
              <div className={`collapse ${cableOpen ? 'show' : ''}`}>
                {renderSubcategories([
                  { name: 'Globe', background: globeBg },
                  { name: 'PLDT', background: pldtBg },
                  { name: 'Converge', background: convergeBg }
                ])}
              </div>

              {/* Telecoms */}
              <ListGroup.Item className='d-flex justify-content-between align-items-center' onClick={() => setTelecomOpen(!telecomOpen)}>
                <div><FaPhone className='me-2' /> Telecoms</div>
                <Button variant='link' className='p-0'>
                  {telecomOpen ? <FaChevronUp /> : <FaChevronDown />}
                </Button>
              </ListGroup.Item>
              <div className={`collapse ${telecomOpen ? 'show' : ''}`}>
                {renderSubcategories([
                  { name: 'Globe at Home', background: globeBg },
                  { name: 'PLDT', background: pldtBg }
                ])}
              </div>

              {/* Credit Cards */}
              <ListGroup.Item className='d-flex justify-content-between align-items-center' onClick={() => setCreditCardOpen(!creditCardOpen)}>
                <div><FaCreditCard className='me-2' /> Credit Cards</div>
                <Button variant='link' className='p-0'>
                  {creditCardOpen ? <FaChevronUp /> : <FaChevronDown />}
                </Button>
              </ListGroup.Item>
              <div className={`collapse ${creditCardOpen ? 'show' : ''}`}>
                {renderSubcategories([
                  { name: 'Visa', background: visaBg },
                  { name: 'Mastercard', background: mastercardBg }
                ])}
              </div>
            </ListGroup>
          </div>
        </Card.Body>
      </Card>

      {/* Render the modal */}
      <PaymentModal
        show={showModal}
        handleClose={handleCloseModal}
        selectedCategory={selectedCategory}
      />
    </>
  );
};

export default BillCategoriesCard;
