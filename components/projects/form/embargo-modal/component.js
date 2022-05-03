import React from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';

import { translateText } from 'utils/functions';

import './style.scss';

const ProjectEmbargoModal = ({ open, onClose }) => (
  <ReactModal
    isOpen={open}
    onRequestClose={onClose}
    className="c-project-embargo-modal"
    contentLabel="Project embargo modal"
  >
    <div className="content-panel">
      <h1 className="h2">What is a derived product?</h1>
      <p>
        Derived products include aggregations of data, summary statistics and other information
        products such as charts, graphs and maps derived through the use of data available in
        Wildlife Insights and compiled and uploaded to the site by Wildlife Insights or a WI Core
        Member. If a derived product includes information not hosted on Wildlife Insights, the
        product will not be uploaded to the site unless Wildlife Insights has the permission of the
        data owner to do so.
      </p>
      <h1 className="h2">Background</h1>
      <p>
        In aggregate, camera trapping information can offer a lens on large-scale biodiversity
        trends that vitally complements data collected through other means. One of the
        transformative aspects of Wildlife Insights is the potential to summarize such information
        broadly without diminishing the impact of projects and campaigns around select species or
        regions. Providing the public with timely metrics or information that capture trends in
        camera trapping or contribute to global conservation efforts is a core Wildlife Insights
        mission. In order for these metrics to be relevant and effective, the inclusion of recent or
        even near-real time information is key. Wildlife Insights endeavors to support this need,
        while respecting the data privacy terms of your dataset and ensuring data attribution.
      </p>
      <h1 className="h2 my-3">Examples of derived product using only camera trap data</h1>
      <h2 className="h3">Wildlife Picture Index (WPI)</h2>
      <p>
        The Wildlife Picture Index (WPI) was developed jointly by the Wildlife Conservation Society
        and the Zoological Society of London as an indicator derived from primary camera trap data
        (O'Brien et al 2010). The WPI was designed to meet the requirements of biodiversity
        monitoring indexes as described by Buckland et al. (2005), and it monitors ground-dwelling
        tropical medium and large mammals and birds, species that are important economically,
        aesthetically and ecologically.
      </p>
      <h2 className="h3">Database Reports</h2>
      <p>
        Database reports are numeric or visual summaries that communicate the scale and scope of
        camera trapping nationally and around the world. These products may be used to inform about
        the status and growth of the Wildlife Insights database. These products will include
        summaries of data such as sampling effort (number of locations and camera-nights) or species
        identifications at either i) the level of biomes, nations or globe at species level or ii)
        the level of 100km cells at order level.
      </p>
      <p>
        They will never present project-level results (such as raw data or site-level summaries) of
        embargoed data without permission of the data owner.
      </p>
      <figure className="figure">
        <img
          src="/static/img/project-form-embargo-database-reports.png"
          className="figure-img img-fluid"
          alt={translateText('Example of Wildlife Insights Database reporting tool')}
        />
        <figcaption className="figure-caption">
          Example of Wildlife Insights Database reporting using a global 100 km grid, summarized at
          the country level (E.g., Ecuador).
        </figcaption>
      </figure>
      <h1 className="h2 my-3">
        Examples of derived products using camera trap and external datasets
      </h1>
      <h3 className="h4">Aggregate Indicator Products</h3>
      <p>
        Aggregate Indicator Products will use species detection data, aggregated to the level of
        order and to national or global scale, in combination with other biodiversity information to
        provide large-scale, numerical indicators of biodiversity status and trends. Aggregate
        Indicator Products based on embargoed data will always be aggregated with other data sources
        and presented at the national and order level, unless otherwise authorized by the data
        provider.
      </p>
      <p>
        For example, WI Core Partner Map of Life, in collaboration with partners (such as the Global
        Biodiversity Information Facility{' '}
        <a href="https://www.gbif.org/" target="_blank" rel="noopener noreferrer">
          GBIF
        </a>
        ), has developed a{' '}
        <a
          href="https://mapoflife.github.io/indicators/static/app/files/coverage/GEOBON_Species_Status_Information_Index.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          “biodiversity knowledge growth” indicator
        </a>{' '}
        (the Species Status Information Index, SSII). The SSII summarizes the annual data coverage
        for a species group in a given country by relating recorded occurrences to regional expert
        expectations.
      </p>
      <figure className="figure">
        <img
          src="/static/img/project-form-embargo-aggregate-product-1.png"
          className="figure-img img-fluid"
          alt={translateText('Example of aggregate indicator product')}
        />
      </figure>
      <figure className="figure">
        <img
          src="/static/img/project-form-embargo-aggregate-product-2.png"
          className="figure-img img-fluid"
          alt={translateText('Example of aggregate indicator product')}
        />
        <figcaption className="figure-caption">
          Example: data coverage for the order Carnivora based on occurrence data from GBIF and WI
          for the nation of Kenya may be 2.2% in 2015 and 2.4% in 2016.
        </figcaption>
      </figure>
      <h3 className="h4">Species Maps</h3>
      <p>
        Camera trapping data fused with environmental information and other (e.g. museum specimen)
        data can support improved species map predictions. Species Map Predictions will use WI data
        in combination with remotely sensed data and models to support the production of continuous
        range maps. Distribution maps will include full provider attribution. For any species
        distribution modeling or visualization using embargoed data, species detection information
        will be simplified to a single occurrence record at minimum 1 km spatial resolution and
        monthly temporal resolution. Any use of embargoed data will be simplified and labeled as
        “private”, protected behind an authentication system and only viewable to a select group of
        taxon experts. Example: A camera trap in Yosemite National Park located at 37°49'02.0"N
        119°33'57.5"W has captured an image of a black bear at 2.15AM on 11 April 2018. This will
        become a black bear record for the respective 1km pixel for the month of April 2018. The
        record will only be visible for internal Map of Life use, i.e. modellers and their
        collaborating experts. Map of Life is happy to hear from WI providers keen to collaborate in
        map production or may reach out to them for engagement.
      </p>
      <figure className="figure">
        <img
          src="/static/img/project-form-embargo-species-map.png"
          className="figure-img img-fluid"
          alt={translateText('Example of species map')}
        />
        <figcaption className="figure-caption">
          Example binary species distribution model output (in red) with all available spatial
          biodiversity information in WI Core Partner{' '}
          <a href="https://mol.org/" target="_blank" rel="noopener noreferrer">
            Map of Life
          </a>
          .
        </figcaption>
      </figure>
    </div>
    <div className="actions-panel">
      <button type="button" className="btn btn-secondary btn-alt" onClick={onClose}>
        Close
      </button>
    </div>
  </ReactModal>
);

ProjectEmbargoModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ProjectEmbargoModal;
