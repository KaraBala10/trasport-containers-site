# Generated manually for certificate of origin and customs clearance fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0008_fclquote_payment_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='fclquote',
            name='certificate_of_origin_type',
            field=models.CharField(
                blank=True,
                choices=[
                    ('none', 'None'),
                    ('non_preferential', 'Non-Preferential Certificate of Origin'),
                    ('preferential', 'Preferential Certificate of Origin'),
                    ('chamber_of_commerce', 'Chamber of Commerce Certificate of Origin'),
                    ('manufacturer', 'Manufacturer Certificate of Origin (MCO)'),
                    ('electronic', 'Electronic Certificate of Origin (e-CO)'),
                    ('eur1', 'EUR.1 Movement Certificate'),
                    ('eur_med', 'EUR-MED Movement Certificate'),
                    ('gsp_form_a', 'GSP Certificate of Origin – Form A'),
                    ('consular', 'Consular Certificate of Origin'),
                    ('product_specific', 'Special Certificates of Origin (Product-Specific)'),
                ],
                default='none',
                max_length=50,
                verbose_name='Certificate of Origin Type'
            ),
        ),
        migrations.AddField(
            model_name='fclquote',
            name='destination_customs_clearance',
            field=models.BooleanField(default=False, verbose_name='Destination Customs Clearance'),
        ),
    ]

