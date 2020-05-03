import React, { Component } from 'react';
import 'ol/ol.css';
import Feature from 'ol/Feature';
import Map from 'ol/map';
import View from 'ol/view';
import Point from 'ol/geom/Point';
import Select from 'ol/interaction/Select';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import VectorSource from 'ol/source/Vector';
import {Icon, Style} from 'ol/style';
import OSM from 'ol/source/OSM';

function createStyle(src, img) {
  return new Style({
    image: new Icon({
      anchor: [0.5, 0.96],
      crossOrigin: 'anonymous',
      src: src,
      img: img,
      imgSize: img ? [img.width, img.height] : undefined
    })
  });
}


class App extends Component {

  componentDidMount() {

    var iconFeature = new Feature(new Point([0, 0]));
    iconFeature.set('style', createStyle('data/icon.png', undefined));
    this.map = new Map({
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        new VectorLayer({
          style: function(feature) {
            return feature.get('style');
          },
          source: new VectorSource({features: [iconFeature]})
        })
      ],
      target: document.getElementById('map'),
      view: new View({
        center: [0, 0],
        zoom: 3
      })
    });
    var selectStyle = {};
    this.select = new Select({
      style: function(feature) {
        var image = feature.get('style').getImage().getImage();
        if (!selectStyle[image.src]) {
          var canvas = document.createElement('canvas');
          var context = canvas.getContext('2d');
          canvas.width = image.width;
          canvas.height = image.height;
          context.drawImage(image, 0, 0, image.width, image.height);
          var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          var data = imageData.data;
          for (var i = 0, ii = data.length; i < ii; i = i + (i % 4 === 2 ? 2 : 1)) {
            data[i] = 255 - data[i];
          }
          context.putImageData(imageData, 0, 0);
          selectStyle[image.src] = createStyle(undefined, canvas);
        }
        return selectStyle[image.src];
      }
    });
    this.map.addInteraction(this.select);

    this.map.on('pointermove', function(evt) {
      evt.map.getTargetElement().style.cursor =
          evt.map.hasFeatureAtPixel(evt.pixel) ? 'pointer' : '';
    });
  }
  render() {
    return (
      <div id="map"
           style={{width: "100%", height: "100vh"}}>
      </div>
    );
  }
}

export default App;