"""
generate_pdf_report.py — Generate a professional PDF report from enrollment data.

This is a STANDALONE script that reads the cleaned JSON data and generates
a PDF report suitable for stakeholder presentations.

Usage:
    pip install reportlab  # One-time install
    py src/generate_pdf_report.py

Output:
    Creates "JHU_Enrollment_Report.pdf" in the project root.

Dependencies:
    reportlab (pip install reportlab)
"""

import json
import os
from datetime import datetime
from pathlib import Path

try:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.platypus import (
        SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer,
        PageBreak, Image
    )
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
except ImportError:
    print("❌ Missing reportlab library.")
    print("   Install it with: pip install reportlab")
    print("   This is optional and won't affect your existing project.")
    exit(1)


# JHU Brand Colors
JHU_NAVY = colors.HexColor('#003366')
JHU_GOLD = colors.HexColor('#E2AF26')
JHU_LIGHT_BLUE = colors.HexColor('#68ACE5')
GRAY = colors.HexColor('#6B7280')
LIGHT_GRAY = colors.HexColor('#F3F4F6')


def load_data():
    """Load enrollment data from the cleaned JSON file."""
    json_path = Path(__file__).parent.parent / "data" / "cleaned" / "enrollment_data.json"
    
    if not json_path.exists():
        print(f"❌ Data file not found: {json_path}")
        print("   Run parse_data.py first to generate the cleaned data.")
        exit(1)
    
    with open(json_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def calculate_metrics(data):
    """Calculate key metrics from the data."""
    leaders = data['leaders']
    cities = data['cities']
    enrollments = data['enrollments']
    
    completed = [e for e in enrollments if e['completion_status'] == 'Completed']
    in_progress = [e for e in enrollments if e['completion_status'] == 'In Progress']
    
    scores = [e['score'] for e in completed if e['score'] is not None]
    avg_score = sum(scores) / len(scores) if scores else 0
    
    # City stats
    city_map = {}
    for e in enrollments:
        if e['city'] not in city_map:
            city_map[e['city']] = {'total': 0, 'completed': 0, 'scores': []}
        city_map[e['city']]['total'] += 1
        if e['completion_status'] == 'Completed':
            city_map[e['city']]['completed'] += 1
            if e['score'] is not None:
                city_map[e['city']]['scores'].append(e['score'])
    
    top_cities = sorted(
        [(city, stats['total']) for city, stats in city_map.items()],
        key=lambda x: x[1],
        reverse=True
    )[:5]
    
    # Program stats
    govex_count = len([e for e in enrollments if e['program_center'] == 'GovEx'])
    bcpi_count = len([e for e in enrollments if e['program_center'] == 'BCPI'])
    
    # Course popularity
    course_map = {}
    for e in enrollments:
        course_map[e['course_name']] = course_map.get(e['course_name'], 0) + 1
    top_courses = sorted(course_map.items(), key=lambda x: x[1], reverse=True)[:5]
    
    return {
        'total_leaders': len(leaders),
        'total_cities': len(cities),
        'total_enrollments': len(enrollments),
        'completed': len(completed),
        'in_progress': len(in_progress),
        'completion_rate': (len(completed) / len(enrollments) * 100) if enrollments else 0,
        'avg_score': avg_score,
        'top_cities': top_cities,
        'govex_count': govex_count,
        'bcpi_count': bcpi_count,
        'govex_pct': (govex_count / len(enrollments) * 100) if enrollments else 0,
        'bcpi_pct': (bcpi_count / len(enrollments) * 100) if enrollments else 0,
        'top_courses': top_courses,
    }


def create_title_page(elements, styles):
    """Create the title page."""
    spacer_large = Spacer(1, 0.5 * inch)
    spacer_small = Spacer(1, 0.2 * inch)
    
    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=28,
        textColor=JHU_NAVY,
        alignment=TA_CENTER,
        spaceAfter=12,
        fontName='Helvetica-Bold'
    )
    
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontSize=16,
        textColor=GRAY,
        alignment=TA_CENTER,
        spaceAfter=6
    )
    
    elements.append(spacer_large)
    elements.append(spacer_large)
    elements.append(Paragraph("Johns Hopkins University", subtitle_style))
    elements.append(Paragraph("School of Government & Policy", subtitle_style))
    elements.append(spacer_small)
    elements.append(Paragraph("ENROLLMENT IMPACT REPORT", title_style))
    elements.append(Paragraph("Government Leadership Programs 2023-2025", subtitle_style))
    elements.append(spacer_large)
    elements.append(spacer_large)
    
    # Report date
    date_style = ParagraphStyle(
        'DateStyle',
        parent=styles['Normal'],
        fontSize=11,
        textColor=GRAY,
        alignment=TA_CENTER
    )
    elements.append(Paragraph(f"Report Generated: {datetime.now().strftime('%B %d, %Y')}", date_style))
    elements.append(PageBreak())


def create_executive_summary(elements, styles, metrics):
    """Create executive summary section."""
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=JHU_NAVY,
        spaceAfter=12,
        fontName='Helvetica-Bold'
    )
    
    body_style = ParagraphStyle(
        'BodyText',
        parent=styles['Normal'],
        fontSize=11,
        textColor=GRAY,
        alignment=TA_LEFT,
        spaceAfter=8,
        leading=16
    )
    
    elements.append(Paragraph("Executive Summary", heading_style))
    elements.append(Spacer(1, 0.2 * inch))
    
    summary_text = f"""
    The Johns Hopkins School of Government & Policy has successfully engaged 
    <b>{metrics['total_leaders']} government leaders</b> across <b>{metrics['total_cities']} cities</b> 
    through its GovEx and BCPI programs. With <b>{metrics['total_enrollments']} total course enrollments</b>, 
    the programs have achieved a <b>{metrics['completion_rate']:.0f}% completion rate</b> and an 
    outstanding average score of <b>{metrics['avg_score']:.1f}%</b>.
    <br/><br/>
    <b>Key Highlights:</b>
    <br/>• High program quality with {metrics['avg_score']:.1f}% average completion score
    <br/>• Strong engagement from {metrics['top_cities'][0][0]} ({metrics['top_cities'][0][1]} enrollments)
    <br/>• Balanced distribution: GovEx ({metrics['govex_pct']:.0f}%) and BCPI ({metrics['bcpi_pct']:.0f}%)
    <br/>• Only {metrics['in_progress']} enrollments in progress, indicating strong follow-through
    """
    
    elements.append(Paragraph(summary_text, body_style))
    elements.append(Spacer(1, 0.3 * inch))


def create_kpi_table(elements, styles, metrics):
    """Create a table of key performance indicators."""
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=JHU_NAVY,
        spaceAfter=12,
        fontName='Helvetica-Bold'
    )
    
    elements.append(Paragraph("Key Performance Indicators", heading_style))
    elements.append(Spacer(1, 0.1 * inch))
    
    kpi_data = [
        ['Metric', 'Value'],
        ['Total Government Leaders', str(metrics['total_leaders'])],
        ['Cities Served', str(metrics['total_cities'])],
        ['Total Enrollments', str(metrics['total_enrollments'])],
        ['Completed Enrollments', f"{metrics['completed']} ({metrics['completion_rate']:.0f}%)"],
        ['In Progress', str(metrics['in_progress'])],
        ['Average Completion Score', f"{metrics['avg_score']:.1f}%"],
        ['GovEx Enrollments', f"{metrics['govex_count']} ({metrics['govex_pct']:.0f}%)"],
        ['BCPI Enrollments', f"{metrics['bcpi_count']} ({metrics['bcpi_pct']:.0f}%)"],
    ]
    
    table = Table(kpi_data, colWidths=[4 * inch, 2 * inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), JHU_NAVY),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), LIGHT_GRAY),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_GRAY]),
        ('TOPPADDING', (0, 1), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
    ]))
    
    elements.append(table)
    elements.append(Spacer(1, 0.3 * inch))


def create_top_cities_table(elements, styles, metrics):
    """Create a table showing top cities."""
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=JHU_NAVY,
        spaceAfter=12,
        fontName='Helvetica-Bold'
    )
    
    elements.append(Paragraph("Top Cities by Enrollment", heading_style))
    elements.append(Spacer(1, 0.1 * inch))
    
    city_data = [['Rank', 'City', 'Total Enrollments']]
    for i, (city, count) in enumerate(metrics['top_cities'], 1):
        city_data.append([str(i), city, str(count)])
    
    table = Table(city_data, colWidths=[1 * inch, 3 * inch, 2 * inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), JHU_GOLD),
        ('TEXTCOLOR', (0, 0), (-1, 0), JHU_NAVY),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_GRAY]),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
    ]))
    
    elements.append(table)
    elements.append(Spacer(1, 0.3 * inch))


def create_top_courses_table(elements, styles, metrics):
    """Create a table showing most popular courses."""
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=JHU_NAVY,
        spaceAfter=12,
        fontName='Helvetica-Bold'
    )
    
    elements.append(Paragraph("Most Popular Courses", heading_style))
    elements.append(Spacer(1, 0.1 * inch))
    
    course_data = [['Rank', 'Course Name', 'Enrollments']]
    for i, (course, count) in enumerate(metrics['top_courses'], 1):
        course_data.append([str(i), course, str(count)])
    
    table = Table(course_data, colWidths=[1 * inch, 3.5 * inch, 1.5 * inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), JHU_LIGHT_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), JHU_NAVY),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_GRAY]),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
    ]))
    
    elements.append(table)
    elements.append(Spacer(1, 0.3 * inch))


def create_insights_section(elements, styles, metrics):
    """Create key insights section."""
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=JHU_NAVY,
        spaceAfter=12,
        fontName='Helvetica-Bold'
    )
    
    body_style = ParagraphStyle(
        'BodyText',
        parent=styles['Normal'],
        fontSize=10,
        textColor=GRAY,
        alignment=TA_LEFT,
        spaceAfter=10,
        leading=14
    )
    
    elements.append(PageBreak())
    elements.append(Paragraph("Key Insights & Recommendations", heading_style))
    elements.append(Spacer(1, 0.2 * inch))
    
    insights = [
        (
            f"1. <b>{metrics['top_cities'][0][0]} Leads Institutional Engagement</b>",
            f"{metrics['top_cities'][0][0]} demonstrates the deepest commitment with {metrics['top_cities'][0][1]} "
            f"enrollments, indicating strong institutional buy-in. This city should be considered a model for "
            f"replicating success in other municipalities."
        ),
        (
            f"2. <b>Outstanding Completion Rate of {metrics['completion_rate']:.0f}%</b>",
            f"With {metrics['completed']} completed enrollments out of {metrics['total_enrollments']} total, "
            f"the programs show exceptional participant commitment. Only {metrics['in_progress']} enrollments "
            f"remain in progress, suggesting effective support systems and relevant curriculum."
        ),
        (
            f"3. <b>High-Quality Learning Outcomes</b>",
            f"An average completion score of {metrics['avg_score']:.1f}% indicates that participants are not "
            f"only completing courses but mastering the content. This validates the program design and "
            f"instructional approach."
        ),
        (
            f"4. <b>Balanced Program Portfolio</b>",
            f"GovEx programs account for {metrics['govex_pct']:.0f}% of enrollments while BCPI represents "
            f"{metrics['bcpi_pct']:.0f}%, showing healthy diversity in offerings that appeal to different "
            f"leadership needs—both operational excellence and innovation."
        ),
    ]
    
    for title, text in insights:
        elements.append(Paragraph(title, body_style))
        elements.append(Paragraph(text, body_style))
        elements.append(Spacer(1, 0.15 * inch))


def create_footer(canvas, doc):
    """Add footer to each page."""
    canvas.saveState()
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(GRAY)
    canvas.drawString(
        inch, 0.5 * inch,
        f"JHU School of Government & Policy | Enrollment Report"
    )
    canvas.drawRightString(
        doc.pagesize[0] - inch, 0.5 * inch,
        f"Page {doc.page}"
    )
    canvas.restoreState()


def generate_pdf():
    """Main function to generate the PDF report."""
    print("📊 Generating PDF report...")
    
    # Load data
    data = load_data()
    metrics = calculate_metrics(data)
    
    # Set up PDF
    output_path = Path(__file__).parent.parent / "JHU_Enrollment_Report.pdf"
    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=letter,
        rightMargin=inch,
        leftMargin=inch,
        topMargin=inch,
        bottomMargin=inch
    )
    
    # Build document
    elements = []
    styles = getSampleStyleSheet()
    
    # Add sections
    create_title_page(elements, styles)
    create_executive_summary(elements, styles, metrics)
    create_kpi_table(elements, styles, metrics)
    create_top_cities_table(elements, styles, metrics)
    create_top_courses_table(elements, styles, metrics)
    create_insights_section(elements, styles, metrics)
    
    # Generate PDF
    doc.build(elements, onFirstPage=create_footer, onLaterPages=create_footer)
    
    print(f"✅ PDF report generated successfully!")
    print(f"   📄 Saved to: {output_path}")
    print(f"\n📈 Report Summary:")
    print(f"   • {metrics['total_leaders']} leaders across {metrics['total_cities']} cities")
    print(f"   • {metrics['total_enrollments']} enrollments with {metrics['completion_rate']:.0f}% completion")
    print(f"   • Average score: {metrics['avg_score']:.1f}%")
    print(f"   • Top city: {metrics['top_cities'][0][0]} ({metrics['top_cities'][0][1]} enrollments)")


if __name__ == "__main__":
    generate_pdf()
