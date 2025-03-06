import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import FileExplorer from '../components/FileExplorer/FileExplorer';

const FileExplorerDemo = () => {
  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1>Explorador de Archivos</h1>
          <p>
            Esta es una demostración de un explorador de archivos usando almacenamiento local. 
            Los archivos se guardan en el navegador usando IndexedDB.
          </p>
        </Col>
      </Row>
      
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <FileExplorer />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FileExplorerDemo;