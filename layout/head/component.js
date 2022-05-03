import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';

class HeadComponent extends React.PureComponent {
  static propTypes = {
    title: PropTypes.string,
    description: PropTypes.string
  }

  static defaultProps = {
    title: 'Welcome',
    description: null,
  }

  render() {
    const { title, description } = this.props;

    return (
      <Head>
        <title key="title">{`${title} | Wildlife Insights`}</title>
        {description && <meta key="description" name="description" content={description} />}
      </Head>
    );
  }
}

export default HeadComponent;
